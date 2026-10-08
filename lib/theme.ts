import { createTheme, type ThemeProviderProps } from "flowbite-react";

export const primaryButton =
  "border border-brand bg-brand-fill text-white hover:bg-brand-hover focus:ring-brand dark:bg-brand-fill dark:hover:bg-brand-hover dark:focus:ring-brand";
export const secondaryButton =
  "border border-control bg-surface text-foreground hover:bg-brand-soft hover:text-brand focus:ring-brand dark:border-control dark:bg-surface dark:text-foreground dark:hover:bg-brand-soft dark:hover:text-brand dark:focus:ring-brand";

const fieldColors =
  "border-control bg-field text-foreground placeholder:text-muted focus:border-brand focus:ring-brand dark:border-control dark:bg-field dark:text-foreground dark:placeholder:text-muted dark:focus:border-brand dark:focus:ring-brand";
const brandBadge =
  "bg-brand-soft text-brand hover:bg-brand-soft dark:bg-brand-soft dark:text-brand dark:hover:bg-brand-soft";
const warningColors =
  "border-warning bg-warning-soft text-warning dark:bg-warning-soft dark:text-warning";

export const appTheme = createTheme({
  button: {
    color: {
      default: primaryButton,
      light: secondaryButton,
      failure: "border border-red-700 bg-red-700 text-white hover:bg-red-800 focus:ring-red-400 dark:border-red-400 dark:bg-red-700 dark:hover:bg-red-800 dark:focus:ring-red-400",
    },
  },
  textInput: { field: { input: { colors: { gray: fieldColors } } } },
  select: { field: { select: { colors: { gray: fieldColors } } } },
  checkbox: {
    base: "border-control dark:border-control",
    color: { default: "text-brand-fill focus:ring-brand ring-offset-surface dark:ring-offset-surface dark:focus:ring-brand" },
  },
  card: {
    root: {
      base: "flex rounded-lg border border-gray-200 bg-surface shadow-sm dark:border-gray-700 dark:bg-surface",
    },
  },
  navbar: {
    root: { base: "bg-surface px-2 py-2.5 sm:px-4 dark:bg-surface" },
    link: {
      base: "block rounded-md py-2 pl-3 pr-4 md:p-0",
      active: {
        on: "bg-brand-soft font-semibold text-brand md:bg-transparent md:text-brand dark:text-brand",
        off: "border-b border-gray-100 text-muted hover:bg-brand-soft md:border-0 md:hover:bg-transparent md:hover:text-brand dark:border-gray-700 dark:text-muted dark:hover:bg-brand-soft dark:hover:text-brand md:dark:hover:bg-transparent md:dark:hover:text-brand",
      },
    },
    toggle: { base: "text-muted hover:bg-brand-soft focus:ring-brand dark:text-muted dark:hover:bg-brand-soft dark:focus:ring-brand" },
  },
  pagination: {
    pages: {
      previous: { base: "border-control bg-surface text-muted enabled:hover:bg-brand-soft enabled:hover:text-brand dark:border-control dark:bg-surface dark:text-muted enabled:dark:hover:bg-brand-soft enabled:dark:hover:text-brand" },
      next: { base: "border-control bg-surface text-muted enabled:hover:bg-brand-soft enabled:hover:text-brand dark:border-control dark:bg-surface dark:text-muted enabled:dark:hover:bg-brand-soft enabled:dark:hover:text-brand" },
      selector: {
        base: "border-control bg-surface text-muted enabled:hover:bg-brand-soft enabled:hover:text-brand dark:border-control dark:bg-surface dark:text-muted enabled:dark:hover:bg-brand-soft enabled:dark:hover:text-brand",
        active: "bg-brand-soft font-semibold text-brand hover:bg-brand-soft hover:text-brand dark:border-control dark:bg-brand-soft dark:text-brand",
      },
    },
  },
  spinner: {
    base: "inline animate-spin text-gray-200 [button_&]:fill-white [button_&]:text-white/30",
    color: { default: "fill-brand" },
  },
  badge: {
    root: {
      color: {
        info: brandBadge,
        success: brandBadge,
        gray: "bg-gray-100 text-muted hover:bg-gray-100 dark:bg-gray-700 dark:text-muted dark:hover:bg-gray-700",
        warning: warningColors,
      },
    },
  },
  alert: { color: { info: brandBadge, success: brandBadge, warning: warningColors } },
  table: {
    body: { base: "group/body divide-gray-200 dark:divide-gray-700" },
    root: {
      base: "w-full text-left text-sm text-muted dark:text-muted",
      shadow: "absolute left-0 top-0 -z-10 h-full w-full rounded-lg bg-surface shadow-sm dark:bg-surface",
    },
  },
  modal: {
    content: { inner: "relative flex max-h-[90dvh] flex-col rounded-lg border border-gray-200 bg-surface text-foreground shadow-lg dark:border-gray-700 dark:bg-surface" },
    header: {
      base: "flex items-start justify-between rounded-t border-b border-gray-200 p-5 dark:border-gray-700",
      close: { base: "text-muted hover:bg-brand-soft hover:text-brand dark:hover:bg-brand-soft dark:hover:text-brand" },
    },
    footer: { base: "flex items-center gap-2 rounded-b border-gray-200 p-6 dark:border-gray-700" },
  },
} satisfies NonNullable<ThemeProviderProps["theme"]>);
