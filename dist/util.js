"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var apglib = require('apg-lib');

var _require = require('../lib/grammarObject'),
    GrammarObject = _require.grammarObject;

var GRAMMAR = new GrammarObject();
/**
 * Add query param string pairs to the string result so far.
 *
 * @param {string} result - The DigitalLink string equivalent so far.
 * @param {object} attributes - Object of attributes, either GS1 or custom.
 * @returns {string} Reduced string containing the new attribute pairs.
 */

var addQueryParams = function addQueryParams(result, attributes) {
  return Object.keys(attributes).reduce(function (res, key) {
    return res.concat("".concat(res.endsWith('?') ? '' : '&').concat(key, "=").concat(attributes[key]));
  }, result);
};
/**
 * Get the top-level parser rule for the input string.
 *
 * @param {string} str - The input string.
 * @returns {string} Either canonicalGS1webURI or customGS1webURI depending on format.
 */


var getStartRule = function getStartRule(str) {
  return str.includes('id.gs1.org') ? 'canonicalGS1webURI' : 'customGS1webURI';
};
/**
 * Create an initialise a parser object, used for multiple applications.
 *
 * @returns {object} Parser object.
 */


var createParser = function createParser() {
  var parser = new apglib.parser();
  parser.stats = new apglib.stats();
  parser.trace = new apglib.trace();
  return parser;
};
/**
 * Run the apglib parser over a given string according to a given grammar rule.
 *
 * @param {string} rule - The rule name from the grammar.
 * @param {string} inputStr - The DigitalLink as a string.
 * @returns {boolean} true if the parser returns 'success', false otherwise.
 */


var validateRule = function validateRule(rule, inputStr) {
  var result = createParser().parse(GRAMMAR, rule, apglib.utils.stringToChars(inputStr), []);
  return result.success;
};
/**
 * Run the apglib parser over the Digital Link URL string.
 *
 * @param {string} inputStr - The DigitalLink as a string.
 * @returns {boolean} true if the parser returns 'success', false otherwise.
 */


var validateUrl = function validateUrl(inputStr) {
  return validateRule(getStartRule(inputStr), inputStr);
};
/**
 * Throw an error if key and value are not strings.
 *
 * @param {string} key - The key to check.
 * @param {string} value - The value to check.
 */


var assertStringPair = function assertStringPair(key, value) {
  if (typeof key !== 'string' || typeof value !== 'string') {
    throw new Error('key and value must be strings');
  }
};
/**
 * Throw an error if object property is not of a certain type.
 *
 * @param {object} dl - The DigitalLink.
 * @param {string} key - The key to check.
 * @param {string} type - The type to check key against.
 */


var assertPropertyType = function assertPropertyType(dl, key, type) {
  if (!dl[key] || _typeof(dl[key]) !== type) {
    throw new Error("".concat(key, " must be ").concat(type));
  }
};
/**
 * Type check and assign a key-value pair to the specified object.
 *
 * @param {object} dl - The DigitalLink.
 * @param {string} prop - Name of the DigitalLink property to modify.
 * @param {string} key - The key to assign.
 * @param {string} value - The value to assign to key.
 */


var assignStringPair = function assignStringPair(dl, prop, key, value) {
  assertStringPair(key, value);
  dl[prop][key] = value;
};
/**
 * Extract text between two markers using a regex.
 *
 * @param {string} str - String to search.
 * @param {string} start - String immediately before the output.
 * @param {string} end - String immediately after the output.
 * @returns {string} String contained between start and end.
 */


var between = function between(str, start, end) {
  var matches = str.match(new RegExp("".concat(start, "(.*?)(?=").concat(end, ")")));
  return matches ? matches[1] : '';
};
/**
 * Get a validation trace showing which parts of the input matched which rules.
 * If the last item has a remainder, that is the part that didn't match.
 *
 * @param {string} inputStr - The input string.
 * @returns {object[]} Array of objects describing the validation trace.
 */


var getTrace = function getTrace(inputStr) {
  var parser = createParser();
  var result = parser.parse(GRAMMAR, getStartRule(inputStr), apglib.utils.stringToChars(inputStr), []);
  var traceHtml = parser.trace.toHtmlPage('ascii', 'Parsing details:').replace('display mode: ASCII', '');
  var rows = traceHtml.substring(traceHtml.indexOf('<table '), traceHtml.indexOf('</table>')).split('<tr>').filter(function (item) {
    return item.includes('&uarr;M');
  });
  var trace = rows.filter(function (row) {
    return row.includes('apg-match');
  }).map(function (row) {
    var rule = row.match(/\((.*?)(?=\))/)[1];
    var sample = row.substring(row.indexOf(')'));
    var match = between(sample, 'match">', '<');
    var remainder = between(sample, 'remainder">', '<');
    return {
      rule: rule,
      match: match,
      remainder: remainder
    };
  }).filter(function (item) {
    return item.match.length > 1;
  });
  return {
    trace: trace,
    success: result.success
  };
};
/**
 * Generate the stats HTML fragment provided by apglib.
 *
 * @param {string} inputStr - The input URL to generate parser stats for.
 * @returns {string} HTML string representing the stats of the validation.
 */


var generateStatsHtml = function generateStatsHtml(inputStr) {
  var parser = createParser();
  parser.parse(GRAMMAR, getStartRule(inputStr), apglib.utils.stringToChars(inputStr), []);
  return parser.stats.toHtml('ops', 'ops-only stats') + parser.stats.toHtml('index', 'rules ordered by index') + parser.stats.toHtml('alpha', 'rules ordered alphabetically') + parser.stats.toHtml('hits', 'rules ordered by hit count');
};
/**
 * Generate the trace HTML fragment provided by apglib.
 *
 * @param {string} inputStr - The input URL to generate parser trace for.
 * @returns {string} HTML string representing the trace steps of the validation.
 */


var generateTraceHtml = function generateTraceHtml(inputStr) {
  var parser = createParser();
  parser.parse(GRAMMAR, getStartRule(inputStr), apglib.utils.stringToChars(inputStr), []);
  return parser.trace.toHtmlPage('ascii', 'Parsing details:');
};
/**
 * Generate the complete HTML fragment provided by apglib for parsing results.
 *
 * @param {string} inputStr - The input URL to generate parser results for.
 * @returns {string} HTML string representing the results of the validation.
 */


var generateResultsHtml = function generateResultsHtml(inputStr) {
  var parser = createParser();
  var startRule = getStartRule(inputStr);
  var result = parser.parse(GRAMMAR, startRule, apglib.utils.stringToChars(inputStr), []);
  return apglib.utils.parserResultToHtml(result);
};

module.exports = {
  addQueryParams: addQueryParams,
  assertPropertyType: assertPropertyType,
  assertStringPair: assertStringPair,
  assignStringPair: assignStringPair,
  validateUrl: validateUrl,
  validateRule: validateRule,
  getTrace: getTrace,
  generateStatsHtml: generateStatsHtml,
  generateTraceHtml: generateTraceHtml,
  generateResultsHtml: generateResultsHtml
};