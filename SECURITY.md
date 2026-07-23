# Security

How to Read contains plain instructions and local installer code.

- It makes no network calls after installation.
- It reads only its packaged skill files.
- It writes only the documented platform paths.
- It fences shared Markdown changes with named markers.
- Its uninstaller removes only owned skill folders and fenced blocks.

Review a remote script before piping it into a shell.
Use the dry run when you want to inspect every target.

Report security issues through GitHub's private vulnerability reporting.
