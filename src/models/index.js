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

const { User, Universe, Card, UserCard } = initSchema(schema);

export {
  User,
  Universe,
  Card,
  UserCard,
  Rarity
};