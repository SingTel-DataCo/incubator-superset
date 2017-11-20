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

MacOS/CentOS instructions:

```bash
# Ensure pip is installed.
[CentOS] sudo yum install -y python-pip

# Install virtualenvwrapper.
sudo pip install virtualenvwrapper
source env/bin/activate

# Setup virtualenvwrapper. Add the following in ~/.bashrc.
export WORKON_HOME=$HOME/.virtualenvs
export PROJECT_HOME=$HOME/Devel
source /usr/bin/virtualenvwrapper.sh

# Source env file.
source ~/.bashrc

# Create a virtualenv named 'superset' with python2 and activate it.
mkvirtualenv superset --python=/usr/bin/python2
workon superset 


# Install dependencies

[MacOS]
brew install pkg-config libffi openssl python
LDFLAGS="-L$(brew --prefix openssl)/lib" CFLAGS="-I$(brew --prefix openssl)/include" python setup.py develop

[CentOS]
sudo yum upgrade python-setuptools
sudo yum install gcc gcc-c++ libffi-devel python-devel python-pip python-wheel openssl-devel libsasl2-devel openldap-devel postgresql-devel nodejs npm
python setup.py develop


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

# [Optional] Start a dev web server
superset runserver -d -p 8070

# Add superset init.d file
cp init.d/superset /etc/init.d/superset
chmod +x /etc/init.d/superset
touch /var/log/superset.log && chown dataspark:dataspark /var/log/superset.log
touc /var/run/superset.pid && chown dataspark:dataspark /var/run/superset.pid

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


### Superset with wso2 authentication

(0)In config.py, set the following
```
AUTH_TYPE = AUTH_OAUTH
AUTH_ROLE_ADMIN = 'Admin'
AUTH_ROLE_PUBLIC = 'Alpha'
AUTH_USER_REGISTRATION = True

SUPERSET_IP=<ip_address_used_to_access_superset>
SUPERSET_WEBSERVER_PORT=8888

#disable ssl cert verification, in case u get error SSL: CERTIFICATE_VERIFY_FAILED
DISABLE_CERTIFICATE_VERIFY=yes

OAUTH_PROVIDERS = [
    {
        'name': 'wso2',
        #'whitelist': ['@gmail.com'],
        'icon': ' fa-pied-piper-alt ',
        'token_key': 'access_token',
        'remote_app': {
            'base_url': 'https://apistore.dsparkanalytics.com.au:8243',
            'request_token_params': {
                'scope': 'email profile am_application_scope default openid'
            },
            'request_token_url': None,
            'access_token_url': '/token',
            'authorize_url': '/authorize',
            #consumer_key is used in the logout_url as well.
            'consumer_key': 'fzznvqwV9edmGou7MaU99zlFiSsa',
            'consumer_secret': '00zLPgYf8AFwvIiwL4lGhs_xyMQa'
        },
        #logout_url points to wso2 carbon server & has 3 placeholders which are automatically filled by the server using 'consumer_key' above, the SUPERSET_WEBSERVER_PORT and SUPERSET_IP params defined in this file above.
        'logout_url' : 'https://apistore.dsparkanalytics.com.au:9445/commonauth?commonAuthLogout=true&type=oauth2&commonAuthCallerPath=http://__SUPERSETIP__:__SUPERSETPORT__/logout&relyingParty=__CONSUMERKEY__'

    }
]
```
(1)Create a user in wso2 with username say, 'superset_admin'.
(2)Create an admin user with the SAME username 'superset_admin' in superset using the command 'fabmanager create-admin --app superset'
(3)run the commands

```
superset db upgrade; superset init ; superset load_examples;
```
(4) run the shell command 
```
#set this environment variable in case you get the error 'urllib2.URLError SSL: CERTIFICATE_VERIFY_FAILED' after logging into wso2 and want to work around it.
export DISABLE_CERTIFICATE_VERIFY=yes
superset runserver -d
```
 
(4) To login into superset, use the admin user you created (he will have Admin Role in superset) and assign roles to other wso2 users.
(5) If there are other wso2 users (Non-Admin), who want to login into superset, 
they can hit the login page of superset directly (no additional steps required. They will get registered in superset automatically.)
The Superset Admin user can assign necessary superset roles to these wso2 users.
See references for help if needed.

### References:

* [Superset Installation & Configuration](https://superset.incubator.apache.org/installation.html)
* [CONTRIBUTING.md](CONTRIBUTING.md)
* https://medium.com/@aungmt/superset-with-google-oauth-3ba7a1c1f459
