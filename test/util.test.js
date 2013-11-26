var assert = require('assert');
var util = require('../routes/util');
var isBlank = util.isBlank;
var should = require('should');

describe('Util', function() {
	it('should detect empty string', function() {
		isBlank('').should.be.true;
	});

	it('should detect multiple empty strings', function() {
		isBlank(' ').should.be.true;
		isBlank('  ').should.be.true;
	});

	it('should detect null as an empty string', function() {
		isBlank(null).should.be.true;	
	});

	it('should detect undefined as an empty string', function() {
		isBlank(undefined).should.be.true;	
	});

	it('should detect any character as non-blank', function() {
		isBlank('a').should.be.false;
	});

	it('should detect any character as non-blank even if starting with spaces', function() {
		isBlank('a').should.be.false;
	});
});