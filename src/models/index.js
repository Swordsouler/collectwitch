// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { User, Card, Universe } = initSchema(schema);

export {
  User,
  Card,
  Universe
};