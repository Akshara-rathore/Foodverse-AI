import os
import json
import uuid
import asyncio
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from app.config import settings

logger = logging.getLogger("foodverse.database")

def serialize_mongo_doc(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Convert any BSON ObjectId into string so FastAPI serialization never fails."""
    if not doc:
        return doc
    doc_copy = dict(doc)
    if "_id" in doc_copy:
        doc_copy["_id"] = str(doc_copy["_id"])
    if "id" not in doc_copy and "_id" in doc_copy:
        doc_copy["id"] = doc_copy["_id"]
    return doc_copy

class MongoCursorWrapper:
    """Wraps Motor cursor to ensure all returned docs have string _id and id."""
    def __init__(self, cursor):
        self.cursor = cursor

    def sort(self, *args, **kwargs):
        self.cursor = self.cursor.sort(*args, **kwargs)
        return self

    def limit(self, *args, **kwargs):
        self.cursor = self.cursor.limit(*args, **kwargs)
        return self

    async def to_list(self, length: Optional[int] = None) -> List[Dict[str, Any]]:
        docs = await self.cursor.to_list(length=length)
        return [serialize_mongo_doc(d) for d in docs]

    def __aiter__(self):
        return self

    async def __anext__(self):
        doc = await self.cursor.__anext__()
        return serialize_mongo_doc(doc)


class MongoCollectionWrapper:
    """Wraps Motor collection to prevent BSON ObjectId mutation errors."""
    def __init__(self, collection):
        self.col = collection

    async def insert_one(self, doc: Dict[str, Any]):
        doc_copy = dict(doc)
        if "_id" not in doc_copy:
            doc_copy["_id"] = str(doc_copy.get("id") or uuid.uuid4())
        elif isinstance(doc_copy["_id"], ObjectId):
            doc_copy["_id"] = str(doc_copy["_id"])
        
        res = await self.col.insert_one(doc_copy)
        doc["_id"] = str(doc_copy["_id"])
        if "id" not in doc:
            doc["id"] = doc["_id"]
        return res

    async def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        doc = await self.col.find_one(query)
        return serialize_mongo_doc(doc)

    def find(self, query: Optional[Dict[str, Any]] = None):
        query = query or {}
        return MongoCursorWrapper(self.col.find(query))

    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any]):
        return await self.col.update_one(query, update)

    async def delete_one(self, query: Dict[str, Any]):
        return await self.col.delete_one(query)

    async def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        query = query or {}
        return await self.col.count_documents(query)


class MockCursor:
    """Async cursor mimicking Motor cursor for local store."""
    def __init__(self, items: List[Dict[str, Any]]):
        self._items = items
        self._index = 0

    def sort(self, key_or_list, direction=None):
        if isinstance(key_or_list, str):
            key = key_or_list
            reverse = (direction == -1)
        elif isinstance(key_or_list, list) and len(key_or_list) > 0:
            key, direction = key_or_list[0]
            reverse = (direction == -1)
        else:
            return self

        def sort_key(doc):
            val = doc.get(key, "")
            return (val is not None, val)

        self._items = sorted(self._items, key=sort_key, reverse=reverse)
        return self

    def limit(self, n: int):
        self._items = self._items[:n]
        return self

    async def to_list(self, length: Optional[int] = None) -> List[Dict[str, Any]]:
        if length is not None:
            return self._items[:length]
        return self._items

    def __aiter__(self):
        self._index = 0
        return self

    async def __anext__(self):
        if self._index < len(self._items):
            item = self._items[self._index]
            self._index += 1
            return item
        raise StopAsyncIteration


class ResilientCollection:
    """Local JSON-persisted collection when MongoDB is not running."""
    def __init__(self, db_instance: "Database", name: str):
        self.db = db_instance
        self.name = name

    def _matches(self, doc: Dict[str, Any], query: Dict[str, Any]) -> bool:
        for k, v in query.items():
            if k == "_id" and str(doc.get("_id")) == str(v):
                continue
            if doc.get(k) != v:
                return False
        return True

    async def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        docs = self.db._data.get(self.name, [])
        for doc in docs:
            if self._matches(doc, query):
                return serialize_mongo_doc(doc)
        return None

    def find(self, query: Optional[Dict[str, Any]] = None) -> MockCursor:
        query = query or {}
        docs = self.db._data.get(self.name, [])
        matched = [serialize_mongo_doc(doc) for doc in docs if self._matches(doc, query)]
        return MockCursor(matched)

    async def insert_one(self, doc: Dict[str, Any]):
        doc_copy = dict(doc)
        if "_id" not in doc_copy:
            doc_copy["_id"] = str(uuid.uuid4())
        if "id" not in doc_copy:
            doc_copy["id"] = doc_copy["_id"]
        if "created_at" not in doc_copy:
            doc_copy["created_at"] = datetime.utcnow().isoformat()
        if self.name not in self.db._data:
            self.db._data[self.name] = []
        self.db._data[self.name].append(doc_copy)
        await self.db.save_local_store()
        
        doc["_id"] = str(doc_copy["_id"])
        doc["id"] = doc_copy["id"]
        class InsertResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id
        return InsertResult(doc_copy["_id"])

    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any]):
        docs = self.db._data.get(self.name, [])
        modified = 0
        set_vals = update.get("$set", {})
        for doc in docs:
            if self._matches(doc, query):
                doc.update(set_vals)
                modified += 1
                break
        if modified > 0:
            await self.db.save_local_store()
        class UpdateResult:
            def __init__(self, modified_count):
                self.modified_count = modified_count
        return UpdateResult(modified)

    async def delete_one(self, query: Dict[str, Any]):
        docs = self.db._data.get(self.name, [])
        for i, doc in enumerate(docs):
            if self._matches(doc, query):
                docs.pop(i)
                await self.db.save_local_store()
                return True
        return False

    async def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        query = query or {}
        docs = self.db._data.get(self.name, [])
        return sum(1 for doc in docs if self._matches(doc, query))


class Database:
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db: Any = None
        self.is_connected_to_mongo: bool = False
        self.storage_file = os.path.join(os.path.dirname(__file__), "..", "data", "store.json")
        self._data: Dict[str, List[Dict[str, Any]]] = {}
        self._load_local_store()

    def _load_local_store(self):
        try:
            os.makedirs(os.path.dirname(self.storage_file), exist_ok=True)
            if os.path.exists(self.storage_file):
                with open(self.storage_file, "r") as f:
                    self._data = json.load(f)
            else:
                self._data = {}
        except Exception as e:
            logger.warning(f"Error loading local store: {e}")
            self._data = {}

    async def save_local_store(self):
        try:
            with open(self.storage_file, "w") as f:
                json.dump(self._data, f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Error saving local store: {e}")

    async def connect(self):
        """Attempt MongoDB connection with short timeout; fallback to local JSON store."""
        try:
            client = AsyncIOMotorClient(
                settings.MONGO_URI,
                serverSelectionTimeoutMS=1500,
                connectTimeoutMS=1500
            )
            # Ping database
            await client.admin.command('ping')
            self.client = client
            self.db = client[settings.MONGO_DB_NAME]
            self.is_connected_to_mongo = True
            logger.info("Successfully connected to live MongoDB!")
        except Exception as e:
            self.is_connected_to_mongo = False
            self.client = None
            logger.info(f"MongoDB not available ({e}). Running in Resilient Local Storage mode.")

    async def close(self):
        if self.client:
            self.client.close()

    def get_collection(self, name: str):
        if self.is_connected_to_mongo and self.db is not None:
            return MongoCollectionWrapper(self.db[name])
        return ResilientCollection(self, name)


db_instance = Database()

def get_collection(name: str):
    return db_instance.get_collection(name)
