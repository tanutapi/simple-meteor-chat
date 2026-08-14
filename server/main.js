import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { check } from 'meteor/check';
import { Messages, Assets } from '../imports/collections';
import moment from 'moment';

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
  'helloMethod'() {
    return `Hey ${this.userId}, how are you?`;
  },
  async 'sendMessage'(msg) {
    check(msg, String);
    if (!this.userId) {
      throw new Meteor.Error(401, 'Unauthorized');
    }
    await Messages.insertAsync({
      from: this.userId,
      msg: msg,
      createdAt: new Date(),
    });
  },
  async 'clearAllMessages'() {
    if (!this.userId) {
      throw new Meteor.Error(401, 'Unauthorized');
    }
    await Messages.removeAsync({});
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
  'methodThatReturnNestedDateObject'() {
    return {
      a: {
        createdAt: new Date(),
        b: {
          c: {
            createdAt: new Date(),
          }
        }
      },
      createdAt: new Date(),
    };
  },
  'methodThatReturnArrayOfNestedDateObject'() {
    var date1 = new Date();
    var date2 = new Date(date1 - 1000);
    var date3 = new Date(date1 - 2000);
    var date4 = new Date(date1 - 3000);
    var date5 = new Date(date1 - 4000);
    var date6 = new Date(date1 - 5000);
    return [{
      a: {
        createdAt: date1,
        b: {
          c: [{
            createdAt: date2,
          }, {
            createdAt: date3,
          }, {
            createdAt: date4,
          }],
          d: [date5, date6],
        }
      },
      createdAt: [date5, date6],
    }, {
      a: {
        createdAt: date1,
        b: {
          c: [{
            createdAt: date2,
          }, {
            createdAt: date3,
          }, {
            createdAt: date4,
          }],
          d: [date5, date6],
        }
      },
      createdAt: [date5, date6],
    }];
  },
  'methodThatReturnTheNextDay'(date) {
    const next = moment(date).add(1, 'day');
    return {
      input: date,
      output: next.toDate(),
    };
  },
  'methodThatAcceptObjectOfDate'(object) {
    const tmp = Object.values(object).filter(x => x instanceof Date);
    if (tmp.length > 0) {
      return object;
    }
    return null;
  },
});

Meteor.startup(async () => {
  try {
    await Accounts.createUserAsync({
      username: 'user1',
      password: 'password1',
      profile: {
        name: 'Apple',
        surname: 'Seed',
      },
    });
  } catch (err) {}

  try {
    await Accounts.createUserAsync({
      username: 'user2',
      password: 'password2',
      profile: {
        name: 'John',
        surname: 'Doe',
      },
    });
  } catch (err) {}

  await Assets.removeAsync({});
  await Assets.insertAsync({
    owner: 'user1',
    properties: [0, 1, 2],
  });
  await Assets.insertAsync({
    owner: 'user2',
    properties: [3, 4, 5],
  });
});