# mailmon.app

An Electron application with React and TypeScript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

### Publish a release

In GitHub Actions, select **Publish release**, then **Run workflow** on the default branch.
The workflow updates `package.json` and `package-lock.json` and builds Windows, macOS,
and Linux packages in parallel. Only after every build succeeds does it commit the version bump
and publish a tag and GitHub Release with all packages attached:

- Windows: x64 installer (`.exe`).
- macOS: universal Intel/Apple Silicon `.dmg` and `.zip` (unsigned and not notarized).
- Linux: x64 `.AppImage` and `.deb`.

Unsigned macOS builds may require explicit approval in macOS Privacy & Security settings.
Linux Snap packages are not built by the release workflow.

Versions advance from `1.0.0` to `1.1.0`, through `1.9.0`, then to `2.0.0`;
the patch version is always reset to zero.

The workflow needs permission to push commits and tags to the repository. Branch protection
rules must allow the release commit; otherwise, the workflow fails without publishing a release.
