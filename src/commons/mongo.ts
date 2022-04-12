export const url = 'mongodb://outerspace:OuterSpace2022@66.42.63.111:27521/outerspace';
import { Collection, Db, MongoClient, Document } from "mongodb";
let mongoClient: MongoClient | null = null;
export const collection = async (collection: string): Promise<Collection<Document>> => {
    mongoClient = await MongoClient.connect(url);
    return mongoClient.db('outerspace').collection(collection);
}

export const closeDb = () => {
    if (mongoClient)
        mongoClient.close();
}