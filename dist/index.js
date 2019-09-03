"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var _require = require('./util'),
    addQueryParams = _require.addQueryParams,
    assertPropertyType = _require.assertPropertyType,
    assertStringPair = _require.assertStringPair,
    assignStringPair = _require.assignStringPair,
    validateUrl = _require.validateUrl,
    validateRule = _require.validateRule,
    getTrace = _require.getTrace,
    generateStatsHtml = _require.generateStatsHtml,
    generateTraceHtml = _require.generateTraceHtml,
    generateResultsHtml = _require.generateResultsHtml;

var _require2 = require('./compression'),
    compressWebUri = _require2.compressWebUri,
    decompressWebUri = _require2.decompressWebUri,
    isCompressedWebUri = _require2.isCompressedWebUri;
/**
 * Individual parser rules that can be run with `testRule()`.
 */


var Rules = {
  gtin: 'gtin-value',
  itip: 'itip-value',
  gmn: 'gmn-value',
  cpid: 'cpid-value',
  shipTo: 'shipTo-value',
  billTo: 'billTo-value',
  purchasedFrom: 'purchasedFrom-value',
  shipFor: 'shipFor-value',
  gln: 'gln-value',
  payTo: 'payTo-value',
  glnProd: 'glnProd-value',
  gsrnp: 'gsrnp-value',
  gsrn: 'gsrn-value',
  gcn: 'gcn-value',
  sscc: 'sscc-value',
  gdti: 'gdti-value',
  ginc: 'ginc-value',
  gsin: 'gsin-value',
  grai: 'grai-value',
  giai: 'giai-value',
  cpv: 'cpv-value',
  lot: 'lot-value',
  ser: 'ser-value',
  cpsn: 'cpsn-value',
  glnx: 'glnx-value',
  refno: 'refno-value',
  srin: 'srin-value',
  customGS1webURI: 'customGS1webURI',
  canonicalGS1webURI: 'canonicalGS1webURI'
};
/**
 * Attempt to populate internal data fields from a Digital Link in URL format.
 *
 * @param {object} dl - The DigitalLink (this).
 * @param {string} str - String input containing Digital Link.
 */

var decode = function decode(dl, str) {
  if (!str.includes('http') || !str.includes('://')) {
    throw new Error('String input must contain http(s) protocol');
  }

  if (str.split('/').length < 5 || str.split('/')[4].length === 0) {
    throw new Error('Must contain at least the identifier');
  } // http(s)://domain.xyz


  dl.domain = str.substring(0, str.indexOf('/', str.indexOf('://') + 3));
  str = str.substring(dl.domain.length); // /first/identifier

  var segments = (str.includes('?') ? str.substring(0, str.indexOf('?')) : str).split('/').filter(function (p) {
    return p.length;
  });
  dl.identifier[segments.shift()] = segments.shift(); // /x/y until query

  while (segments.length) {
    dl.keyQualifiers[segments.shift()] = segments.shift();
  } // ?x=y...


  if (str.includes('?')) {
    str.substring(str.indexOf('?') + 1).split('&').forEach(function (pair) {
      var _pair$split = pair.split('='),
          _pair$split2 = _slicedToArray(_pair$split, 2),
          key = _pair$split2[0],
          value = _pair$split2[1];

      dl.attributes[key] = value;
    });
  }
};
/**
 * Concatenate all the DigitalLink's properties into a GS1 Digital Link string.
 *
 * @param {object} dl - The DigitalLink (this).
 * @returns {string} The Digital Link in string form.
 */


var encode = function encode(dl) {
  var result = dl.domain; // Identifier

  var idKey = Object.keys(dl.identifier)[0];
  result += "/".concat(idKey, "/").concat(dl.identifier[idKey]); // Key qualifiers

  if (dl.keyQualifiers) {
    Object.keys(dl.keyQualifiers).forEach(function (key) {
      result += "/".concat(key, "/").concat(dl.keyQualifiers[key]);
    });
  } // Data Attributes


  if (Object.keys(dl.attributes).length) {
    result = addQueryParams("".concat(result, "?"), dl.attributes);
  }

  return result;
};
/**
 * Construct a DigitalLink either from object params, a string, or built using
 * the available setters.
 *
 * @param {(object|string)} [input] - Optional input construction object or string.
 * @returns {object} The DigitalLink instance with populated data.
 */


var DigitalLink = function DigitalLink(input) {
  // Model should only be manipulated through getters and setters to ensure types are correct
  var model = Symbol('model');

  var result = _defineProperty({}, model, {
    domain: '',
    identifier: {},
    keyQualifiers: {},
    attributes: {}
  });

  if (_typeof(input) === 'object') {
    // Domain and identifier are required
    assertPropertyType(input, 'domain', 'string');
    result[model].domain = input.domain;
    assertPropertyType(input, 'identifier', 'object');
    result[model].identifier = input.identifier; // The rest are optional

    if (input.keyQualifiers) {
      assertPropertyType(input, 'keyQualifiers', 'object');
      result[model].keyQualifiers = input.keyQualifiers;
    }

    if (input.attributes) {
      assertPropertyType(input, 'attributes', 'object');
      result[model].attributes = input.attributes;
    }
  }

  if (typeof input === 'string') {
    decode(result[model], isCompressedWebUri(input) ? decompressWebUri(input) : input);
  }

  result.setDomain = function (domain) {
    if (typeof domain !== 'string') {
      throw new Error('domain must be a string');
    }

    result[model].domain = domain;
    return result;
  };

  result.setIdentifier = function (key, value) {
    assertStringPair(key, value);
    result[model].identifier = _defineProperty({}, key, value);
    return result;
  };

  result.setKeyQualifier = function (key, value) {
    assignStringPair(result[model], 'keyQualifiers', key, value);
    return result;
  };

  result.setAttribute = function (key, value) {
    assignStringPair(result[model], 'attributes', key, value);
    return result;
  };

  result.getDomain = function () {
    return result[model].domain;
  };

  result.getIdentifier = function () {
    return result[model].identifier;
  };

  result.getKeyQualifier = function (key) {
    return result[model].keyQualifiers[key];
  };

  result.getKeyQualifiers = function () {
    return result[model].keyQualifiers;
  };

  result.getAttribute = function (key) {
    return result[model].attributes[key];
  };

  result.getAttributes = function () {
    return result[model].attributes;
  };

  result.toWebUriString = function () {
    return encode(result[model]);
  };

  result.toCompressedWebUriString = function () {
    return compressWebUri(result.toWebUriString());
  };

  result.toJsonString = function () {
    return JSON.stringify(result[model]);
  };

  result.isValid = function () {
    return validateUrl(result.toWebUriString());
  };

  result.getValidationTrace = function () {
    return getTrace(result.toWebUriString());
  };

  return result;
};
/**
 * Test a single parser rule for a given value, such as a GTIN.
 * Available rules are found in `Rules` object of this library.
 *
 * @param {string} rule - A rule from the `Rules` object.
 * @param {string} value - The value to validate.
 * @returns {boolean} true if the value passes against the rule.
 */


var testRule = function testRule(rule, value) {
  if (!Object.keys(Rules).some(function (p) {
    return Rules[p] === rule;
  })) {
    throw new Error("Invalid rule: ".concat(rule));
  }

  return validateRule(rule, value);
};

module.exports = {
  DigitalLink: DigitalLink,
  Utils: {
    Rules: Rules,
    testRule: testRule,
    generateStatsHtml: generateStatsHtml,
    generateTraceHtml: generateTraceHtml,
    generateResultsHtml: generateResultsHtml,
    compressWebUri: compressWebUri,
    decompressWebUri: decompressWebUri,
    isCompressedWebUri: isCompressedWebUri
  }
};