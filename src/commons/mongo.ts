export const url = 'mongodb://outerspace:OuterSpace2022@66.42.63.111:27521/outerspace';
import { Collection, Db, MongoClient, Document } from "mongodb";

export const collection = async (collection: string) : Promise<Collection<Document>> => {
    let mongoClient : MongoClient = await MongoClient.connect(url);
    return mongoClient.db('outerspace').collection(collection);
}