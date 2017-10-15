from __future__ import division
from __future__ import absolute_import

import logging
from flask import session
from superset import utils
from pydruid.client import PyDruid


log = logging.getLogger(__name__)

class Wso2PyDruid(PyDruid):
    """
    This pydruid allows for wso2 authorization http headers to be put in while sending request to druid.

    :param str url: URL of Broker node in the Druid cluster
    :param str endpoint: Endpoint that Broker listens for queries on
    """

    def __init__(self, url, endpoint):
        super(PyDruid, self).__init__(url, endpoint)

    def _prepare_url_headers_and_body(self, query):
        headers, querystr, url = super(Wso2PyDruid, self)._prepare_url_headers_and_body(query)
        oauth_access_token = session.get('oauth') #oauth_access_token is of type tuple
        oauth_access_token_string = "".join(oauth_access_token) #convert tuple to string by join.
        if utils.isNotEmpty(oauth_access_token_string):
            wso2_access_bearer_token_value = "".join(["Bearer ", oauth_access_token_string])
            headers['Authorization'] = wso2_access_bearer_token_value
        log.debug(headers)
        return headers, querystr, url
