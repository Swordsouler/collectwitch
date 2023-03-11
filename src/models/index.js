// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const Rarity = {
  "COMMON": "COMMON",
  "RARE": "RARE",
  "EPIC": "EPIC",
  "LEGENDARY": "LEGENDARY",
  "EXCLUSIVE": "EXCLUSIVE"
};

const { Universe, Card, UserCard, User } = initSchema(schema);

export {
  Universe,
  Card,
  UserCard,
  User,
  Rarity
};