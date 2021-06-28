import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Messages, Assets } from '../imports/collections';

Meteor.publish('messages', function() {
  if (this.userId) {
    return Messages.find({}, {sort: { createdAt: 1 }});
  }
  this.ready();
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
  this.ready();
});

Meteor.publish('assets', function(username) {
  if (this.userId) {
    return Assets.find({owner: username});
  }
  this.ready();
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
  'methodThatReturnNumber'() {
    return 123.456;
  },
  'methodThatReturnString'() {
    return 'hello world';
  },
  'methodThatReturnDateTime'() {
    return new Date();
  },
  'methodThatReturnObject'() {
    return {
      createdAt: new Date(),
    };
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

Assets.remove({});
Assets.insert({
  owner: 'user1',
  properties: [0, 1, 2],
});
Assets.insert({
  owner: 'user2',
  properties: [3, 4, 5],
});