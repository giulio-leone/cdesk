---
description: Manage per-account Claude Desktop instances (create, list, sync, claim, backup)
argument-hint: [create <Name> | list | apply | sync | claim <Name>|main | backup <Name>]
---

Use the `cdesk` skill to handle this request: $ARGUMENTS

If no arguments were given, run `cdesk list` and report the instances, their
versions, and which app currently owns the `claude://` scheme — then ask what
the user wants to change.
