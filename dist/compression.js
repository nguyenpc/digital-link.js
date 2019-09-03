"use strict";

var GS1DigitalLinkToolkit = require('../lib/GS1DigitalLinkCompressionPrototype/GS1DigitalLinkToolkit');

var toolkit = new GS1DigitalLinkToolkit();
/**
 * Get the stem of a URI.
 *
 * @param {string} uri - The URI.
 * @returns {string} The URI stem.
 */

var getUriStem = function getUriStem(uri) {
  return uri.split('/').slice(0, 3).join('/');
};
/**
 * Use GS1DigitalLinkToolkit to compress a URI string.
 *
 * @param {string} uri - The URI to compress.
 * @param {boolean} [useOptimisations] - Set to false to disable optimisations.
 * @param {boolean} [compressOtherKeyValuePairs] - Set to false to disable compression of other
 *                                                 key-value pairs.
 * @returns {string} The equivalent compressed URI.
 */


var compressWebUri = function compressWebUri(uri) {
  var useOptimisations = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var compressOtherKeyValuePairs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  var uncompressedPrimary = false;
  var useShortText = false;
  return toolkit.compressGS1DigitalLink(uri, useShortText, // Not used
  getUriStem(uri), uncompressedPrimary, // Not used
  useOptimisations, compressOtherKeyValuePairs);
};
/**
 * Use GS1DigitalLinkToolkit to decompress a URI string.
 *
 * @param {string} uri - The URI to decompress.
 * @param {boolean} [useShortText] - Set to true to use short AI names, eg. 'gtin' instead of '01'.
 * @returns {string} The equivalent decompressed URI.
 */


var decompressWebUri = function decompressWebUri(uri) {
  var useShortText = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  return toolkit.decompressGS1DigitalLink(uri, useShortText, getUriStem(uri));
};
/**
 * Detect whether a string is a compressed URI or not.
 * The GS1DigitalLinkToolkit returns one of three strings based on if the input looks compressed:
 *   "uncompressed GS1 Digital Link"
 *   "partially compressed GS1 Digital Link"
 *   "fully compressed GS1 Digital Link"
 *
 * Note: this function includes the result's validity, meaning only valid compressed URIs,
 * are supported. Since we cannot compress invalid URIs, this is acceptable.
 *
 * @param {string} uri - The URI.
 * @returns {boolean} true if the URI is valid and looks compressed, false otherwise.
 */


var isCompressedWebUri = function isCompressedWebUri(uri) {
  var data = toolkit.analyseURI(uri);
  var looksCompressed = ['fully', 'partially'].some(function (p) {
    return data.detected.includes(p);
  });

  if (!looksCompressed) {
    return false;
  }

  try {
    decompressWebUri(uri);
    return true;
  } catch (e) {
    // An error is thrown if the decompress result is not a valid URI.
    return false;
  }
};

module.exports = {
  compressWebUri: compressWebUri,
  decompressWebUri: decompressWebUri,
  isCompressedWebUri: isCompressedWebUri
};