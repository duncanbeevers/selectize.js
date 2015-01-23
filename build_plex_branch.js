#!/usr/bin/env node

'use strict';

var child_process = require('child_process');

var branches = [
  'duncanbeevers/plex-styles',
  'duncanbeevers/delete-control-direction',
  'duncanbeevers/select-on-blur',
  'duncanbeevers/preserve-focus-over-entire-control',
  'duncanbeevers/allow-create-empty',
  'duncanbeevers/restore-on-focus',
  'duncanbeevers/label-activates'
];

var plugins = [
  'remove_button',
  'restore_on_focus',
  'restore_on_backspace'
];

function start() {
    child_process.exec([
    'git fetch origin',
    'git fetch duncanbeevers',
    'git branch -D plex',
    'git checkout -b plex',
    'git reset --hard duncanbeevers/build-plex-branch',
    'git rebase origin/master'
  ].join(';'), function () {
    // `plex` branch is at origin/master and ready to receive branches
    next();
  });
}

function next() {
  if (!branches.length) {
    cleanup();
    return;
  }

  var branch = branches.shift();

  console.log('applying ' + branch);
  child_process.exec([
    'git branch -D rebase-head',
    'git checkout ' + branch,
    'git checkout -b rebase-head',
    'git rebase plex',
    'git checkout plex',
    'git merge rebase-head --ff-only',
  ].join(';'), function () {
    next();
  });
}
function cleanup() {
  child_process.exec([
    'git branch -D rebase-head',
  ].join(';'), function () {
    compile();
  });
}

function compile() {
  console.log('compiling with plugins ' + plugins.join(','));
  child_process.exec([
    'grunt --plugins=' + plugins.join(',')
  ].join(';'), function () {
    publish();
  });
}

function publish() {
  child_process.exec([
    'git add dist',
    'git commit -m "Compile with minimal plugins"'
  ].join(';'), function () {
    console.log('compiled');
    finalize();
  });
}

function finalize() {
  console.log('Copy these resouces');
  console.log('cp dist/js/standalone/selectize.js ~/Projects/plex/plex-web-client/app/js/libs/selectize-0.12.0-plex.js');
  console.log('cp dist/less/selectize.less ~/Projects/plex/plex-web-client/app/less/selectize/selectize.less');
  console.log('cp dist/less/selectize.bootstrap3.less ~/Projects/plex/plex-web-client/app/less/selectize/selectize.bootstrap3.less');
  var fs = require('fs');
  plugins.forEach(function (name) {
    var filename = 'dist/less/plugins/' + name + '.less';
    if (fs.existsSync(filename)) {
      console.log('cp ' + filename + ' ~/Projects/plex/plex-web-client/app/less/selectize/plugins/' + name + '.less');
    }
  });
 }

start();

