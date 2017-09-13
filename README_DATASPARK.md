# DataSpark Customisations on Superset

Current base version: 0.18.5

Customisations:

* GeoJSON files for Singapore
    * Planning Region
    * Planning Area
    * Sub Zone
* GeoJSON files for Australia
    * State
    * SA4
    * SA3
    * SA2
    * SA1

## Development Environment

Mac OS instructions:

```bash
# [optional] setup a virtual env and activate it
virtualenv env
source env/bin/activate

# Update the file setup.py
Under the section install_requires, add the following line:
'flask==0.12.1',


# Install dependencies(For MAC only)
brew install pkg-config libffi openssl python
LDFLAGS="-L$(brew --prefix openssl)/lib" CFLAGS="-I$(brew --prefix openssl)/include" python setup.py develop

# Install dependencies(For Fedora and RHEL-derivatives Only)
sudo yum upgrade python-setuptools
sudo yum install gcc gcc-c++ libffi-devel python-devel python-pip python-wheel openssl-devel libsasl2-devel openldap-devel
python setup.py develop

# To install postgres driver
pip install psycopg2

# Copy superset_config.py to PYTHONPATH (Eg: /usr/lib/python2.7)
# Change owner to dataspark user and set Perm as 755

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
