# DataSpark Customisations on Superset

Current base version: 0.18.5

Customisations:

* GeoJSON files for Singapore
    * Planning Region
    * Planning Area
    * Sub Zone

## Development Environment

Mac OS instructions:

```bash
# [optional] setup a virtual env and activate it
virtualenv env
source env/bin/activate

# Install dependencies
brew install pkg-config libffi openssl python

# Install for development
LDFLAGS="-L$(brew --prefix openssl)/lib" CFLAGS="-I$(brew --prefix openssl)/include" python setup.py develop

# Create an admin user
fabmanager create-admin --app superset

# Initialize the database
superset db upgrade

# Create default roles and permissions
superset init

# Load some data to play with
superset load_examples

# Start a dev web server
superset runserver -d

# Set up npm dev environment
cd superset/assets/

# Install npm dependencies
npm install yarn
node_modules/yarn/bin/yarn

# Copies a conf file from the frontend to the backend
npm run sync-backend

# Start a web server that manages and updates your assets as you modify them
npm run dev
```

### References:

* [Superset Installation & Configuration](https://superset.incubator.apache.org/installation.html)
* [CONTRIBUTING.md](CONTRIBUTING.md)
