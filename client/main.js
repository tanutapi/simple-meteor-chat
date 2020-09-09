import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Messages, Assets } from '../imports/collections';

import './main.html';

Template.login.helpers({

});

Template.login.events({
  'submit form'(event, template) {
    event.preventDefault();
    const username = template.$('#username').val();
    const password = template.$('#password').val();
    Meteor.loginWithPassword(username, password, (err) => {
      console.log(err);
      template.$('.txtError').html(err.message);
    });
  },
});

Template.login.onCreated(function() {

});

Template.chat.helpers({
  user(idUser) {
    return Meteor.users.findOne(idUser);
  },
  messages() {
    return Messages.find({}, {
      sort: {
        createdAt: 1,
      },
    });
  }
});

Template.chat.events({
  'click .btnLogout'() {
    Meteor.logout();
  },
  'click .btnSend'(event, template) {
    const msg = template.$('.txtMessage').val();
    Meteor.call('sendMessage', msg, (err, res) => {
      template.$('.txtMessage').val('');
    });
  },
  'click .btnClearAll'() {
    if (confirm('Do you want to delete all chat message?')) {
      Meteor.call('clearAllMessages');
    }
  }
});

Template.chat.onCreated(function() {
  this.subscribe('messages');
});

Template.asset.helpers({
  users() {
    return Meteor.users.find();
  },
  assets() {
    return Assets.find();
  },
});

Template.asset.events({
  'change select'(event, template) {
    template.rvAssetOf.set(event.currentTarget.value);
  }
});

Template.asset.onCreated(function() {
  this.rvAssetOf = new ReactiveVar();

  this.autorun(() => {
    this.subscribe('assets', this.rvAssetOf.get());
  });
});
