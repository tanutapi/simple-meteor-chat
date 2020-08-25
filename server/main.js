import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Messages } from '../imports/collections';

Meteor.publish('messages', function() {
  if (this.userId) {
    return Messages.find({}, {sort: { createdAt: 1 }});
  }
  return [];
});

Meteor.publish(null, function() {
  if (this.userId) {
    return Meteor.users.find({}, {
      fields: {
        username: 1,
        profile: 1,
      },
    });
  }
  return [];
});

Meteor.methods({
  'sendMessage'(msg) {
    check(msg, String);
    if (!this.userId) {
      throw new Meteor.Error(401, 'Unauthorized');
    }
    Messages.insert({
      from: this.userId,
      msg: msg,
      createdAt: new Date(),
    });
  },
  'clearAllMessages'() {
    if (!this.userId) {
      throw new Meteor.Error(401, 'Unauthorized');
    }
    Messages.remove({});
  },
  'methodThatThrowErrorAsString'() {
    throw new Meteor.Error('error', 'This is an error');
  },
  'methodThatThrowErrorAsInt'() {
    throw new Meteor.Error(500, 'This is an error');
  },
});

try {
  Accounts.createUser({
    username: 'user1',
    password: 'password1',
    profile: {
      name: 'Apple',
      surname: 'Seed',
    },
  });
} catch (err) {}

try {
  Accounts.createUser({
    username: 'user2',
    password: 'password2',
    profile: {
      name: 'John',
      surname: 'Doe',
    },
  });
} catch (err) {}