/**
 * Helper functions
 */

'use strict';

/**
 * Module dependencies.
 */

var constants = require('./constants');

/**
 * Body
 */

function body(request, next) {
  if (request.err) return next(false, request.err, undefined, request.res);

  next(false, undefined, request.res.body, request.res);
}

/**
 * First item in body
 */

function bodyItem(request, next) {
  if (request.err) return next(false, request.err, undefined, request.res);

  if (request.res.body && request.res.body.length) {
    return next(false, undefined, request.res.body[0], request.res);
  }

  next(false, undefined, undefined, request.res);
}

/**
 * Empty
 */

function empty(request, next) {
  if (request.err) return next(false, request.err, undefined, request.res);

  next(false, undefined, undefined, request.res);
}

/**
 * Normalize keys
 */

function normalizeKeys(obj) {
  var result = {};

  if (obj) {
    for (var name in obj) {
      if (obj.hasOwnProperty(name)) {
        result[name.replace(/_/g, '').toLowerCase()] = obj[name];
      }
    }
  }

  return result;
}

/**
 * Common options
 */

function options(req, opts) {
  if (!opts) opts = {};

  if (!req.query) req.query = {};

  if (opts.dc) req.query.dc = opts.dc;
  if (opts.wan) req.query.wan = '1';

  if (opts.consistent) {
    req.query.consistent = '1';
  } else if (opts.stale) {
    req.query.stale = '1';
  }

  if (opts.hasOwnProperty('index')) req.query.index = opts.index;
  if (opts.hasOwnProperty('wait')) req.query.wait = opts.wait;
  if (opts.hasOwnProperty('token')) req.query.token = opts.token;

  // papi
  if (opts.hasOwnProperty('ctx')) req.ctx = opts.ctx;
  if (opts.hasOwnProperty('timeout')) req.timeout = opts.timeout;
}

/**
 * Decode value
 */

function decode(value, opts) {
  if (typeof value !== 'string') return value;
  value = new Buffer(value, 'base64');
  if (!opts || !opts.buffer) value = value.toString();
  return value;
}

/**
 * Shallow clone
 */

function clone(src) {
  var dst = {};

  for (var key in src) {
    if (src.hasOwnProperty(key)) {
      dst[key] = src[key];
    }
  }

  return dst;
}

/**
 * Parse duration
 */

function parseDuration(value) {
  if (typeof value === 'number') return value / 1e6;
  if (typeof value !== 'string') return;

  var n;
  var m = value.match(/^(\d*\.?\d*)$/);

  if (m) {
    n = parseFloat(m[1]);

    if (!isNaN(n)) return n / 1e6;
  }

  m = value.match(/^([\d\.]*)(ns|us|ms|s|m|h)$/);

  if (!m) return;

  n = parseFloat(m[1]);

  if (isNaN(n)) return;

  return n * constants.DURATION_UNITS[m[2]] / 1e6;
}

/**
 * Set timeout with cancel support
 */

function setTimeoutContext(fn, ctx, timeout) {
  var id;

  var cancel = function() {
    clearTimeout(id);
  };

  id = setTimeout(function() {
    ctx.removeListener('cancel', cancel);

    fn();
  }, timeout);

  ctx.once('cancel', cancel);
}

/**
 * Set interval with cancel support
 */

function setIntervalContext(fn, ctx, timeout) {
  var id;

  var cancel = function() {
    clearInterval(id);
  };

  id = setInterval(function() { fn(); }, timeout);

  ctx.once('cancel', cancel);
}

/**
 * Module exports
 */

exports.body = body;
exports.bodyItem = bodyItem;
exports.decode = decode;
exports.empty = empty;
exports.normalizeKeys = normalizeKeys;
exports.options = options;
exports.clone = clone;
exports.parseDuration = parseDuration;
exports.setTimeoutContext = setTimeoutContext;
exports.setIntervalContext = setIntervalContext;
