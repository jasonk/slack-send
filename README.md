# slack-send #

This is a command-line tool for sending messages to
[Slack](https://slack.com/).  It was primarily designed for
automation, to provide an easy way to send rich, detailed messages
from things like CI/CD build systems, deployment scripts and other
automated systems.

## Features ##

* Send rich detailed messages from your automated systems to Slack.
* Use "attachers" to add attachments containing useful information.
* Easily create your own "attachers" to augment your messages with
  additional useful information.
* Supports Slack message threading, so instead of having all the
  messages from all your tools jumbled together and trying to pick out
  the relevant parts, you can send an initial message to the channel
  about what process is starting, and then send detailed information
  about that process to a thread for anyone that might need details.
* Flexible configuration options

## Basic Usage ##

## Configuration ##

## Notes ##

Note that this tool uses the [chat.postMessage API][postMessage],
which has it's own rate limiting.

[postMessage]: https://api.slack.com/methods/chat.postMessage
