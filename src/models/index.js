// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { User, Universe, Card, UserCard } = initSchema(schema);

export {
  User,
  Universe,
  Card,
  UserCard
};