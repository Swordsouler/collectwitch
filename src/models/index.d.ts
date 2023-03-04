import { ModelInit, MutableModel, __modelMeta__, ManagedIdentifier } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled, AsyncItem, AsyncCollection } from "@aws-amplify/datastore";





type EagerUser = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<User, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly twitchID: string;
  readonly prefferedCard?: Card | null;
  readonly cards?: (UserCard | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly userPrefferedCardId?: string | null;
}

type LazyUser = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<User, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly twitchID: string;
  readonly prefferedCard: AsyncItem<Card | undefined>;
  readonly cards: AsyncCollection<UserCard>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly userPrefferedCardId?: string | null;
}

export declare type User = LazyLoading extends LazyLoadingDisabled ? EagerUser : LazyUser

export declare const User: (new (init: ModelInit<User>) => User) & {
  copyOf(source: User, mutator: (draft: MutableModel<User>) => MutableModel<User> | void): User;
}

type EagerUniverse = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Universe, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly cards?: (Card | null)[] | null;
  readonly name: string;
  readonly icon?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyUniverse = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Universe, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly cards: AsyncCollection<Card>;
  readonly name: string;
  readonly icon?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Universe = LazyLoading extends LazyLoadingDisabled ? EagerUniverse : LazyUniverse

export declare const Universe: (new (init: ModelInit<Universe>) => Universe) & {
  copyOf(source: Universe, mutator: (draft: MutableModel<Universe>) => MutableModel<Universe> | void): Universe;
}

type EagerCard = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Card, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly cover?: string | null;
  readonly color: string;
  readonly releaseWave: number;
  readonly universeID: string;
  readonly users?: (UserCard | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyCard = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Card, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly cover?: string | null;
  readonly color: string;
  readonly releaseWave: number;
  readonly universeID: string;
  readonly users: AsyncCollection<UserCard>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Card = LazyLoading extends LazyLoadingDisabled ? EagerCard : LazyCard

export declare const Card: (new (init: ModelInit<Card>) => Card) & {
  copyOf(source: Card, mutator: (draft: MutableModel<Card>) => MutableModel<Card> | void): Card;
}

type EagerUserCard = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<UserCard, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly userId?: string | null;
  readonly cardId?: string | null;
  readonly user: User;
  readonly card: Card;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyUserCard = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<UserCard, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly userId?: string | null;
  readonly cardId?: string | null;
  readonly user: AsyncItem<User>;
  readonly card: AsyncItem<Card>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type UserCard = LazyLoading extends LazyLoadingDisabled ? EagerUserCard : LazyUserCard

export declare const UserCard: (new (init: ModelInit<UserCard>) => UserCard) & {
  copyOf(source: UserCard, mutator: (draft: MutableModel<UserCard>) => MutableModel<UserCard> | void): UserCard;
}