import { test } from "node:test";
import assert from "node:assert/strict";
import { validateEmail, validatePassword } from "../validation.js";

test("validateEmail accepts normal addresses", () => {
  assert.equal(validateEmail("ana@example.com"), true);
  assert.equal(validateEmail("ana.lopez+web@sub.example.es"), true);
});

test("validateEmail rejects malformed addresses", () => {
  for (const email of ["", "   ", "ana", "ana@", "ana@example", "a na@example.com"]) {
    assert.equal(validateEmail(email), false, email);
  }
});

test("validatePassword accepts passwords with a letter and a number", () => {
  assert.equal(validatePassword("abcdefg1"), null);
  assert.equal(validatePassword("ñandú2024"), null);
  assert.equal(validatePassword("a".repeat(71) + "1"), null);
});

test("validatePassword explains what is wrong", () => {
  assert.match(validatePassword(""), /Introduce/);
  assert.match(validatePassword("abc1"), /al menos 8/);
  assert.match(validatePassword("abcdefgh"), /letra y un número/);
  assert.match(validatePassword("12345678"), /letra y un número/);
  // 73 bytes in UTF-8 although only 37 characters: same limit as BCrypt in the backend
  assert.match(validatePassword("ñ".repeat(36) + "1"), /demasiado larga/);
});
