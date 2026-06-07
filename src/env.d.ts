/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    lang: import('./lib/i18n').Lang;
  }
}
