# purrl

## Installation

Install `purrl` as a dev dependency of your project

```bash
pnpm add -D purrl
```

## Usage

Run `purrl` in your terminal or add it into your `package.json` scripts.

> [!NOTE]
> You need to run `purrl` with `sudo` in order since it needs to modify the `/etc/hosts` and listen to ports 80 and 443 (in case of https).

### From terminal

```bash
sudo pnpm purrl localhost:3000 example.local
```

### From package.json

```json
{
  "scripts": {
    "start-proxy": "sudo purrl localhost:3000 example.local"
  }
}
```

## Examples

### Expose localhost to example.local

```bash
purrl localhost:3000 example.local
```

Now browse [http://example.local](http://example.local) in your browser to see the result.

### Expose localhost to example.local with https

```bash
purrl localhost:3000 example.local --ssl
```

Now browse [https://example.local](https://example.local) in your browser to see the result.

## Specification

```console
USAGE
  purrl localhost:3000 example.local
  purrl localhost:3000 example.local --ssl # expose with https
  purrl --help
  purrl --version

Expose your localhost to a custom local domain

FLAGS
     [--ssl]     If passed the destination will be exposed over HTTPS [default = false]
  -h  --help     Print help information and exit
  -v  --version  Print version information and exit

ARGUMENTS
  arg1  Origin path
  arg2  Destination path
```
