import z from '@deepseek-ai/schemastery';

/**
 * Host half of the personalization bundle.
 *
 * It owns one volatile settings field. The Client half stores the complete
 * personalization preference JSON there through `ctx.configForms`, so choices
 * persist in the active profile's patch instead of origin-scoped localStorage
 * (the desktop web GUI picks a new port on every launch, which changes the
 * localStorage origin and would reset the theme on each restart).
 */
export const Config = z.object({
  preferences: z.string().default('').volatile(),
});

/**
 * Opt this entry out of the auto-generated configuration page: the plugin ships
 * its own personalization surface, and the raw preference JSON must not be
 * exposed as a generic form field.
 * @param ctx - Host plugin context.
 */
export function apply(ctx) {
  ctx.inject(['settings'], (child) => {
    child.effect(() => child.settings.configure({ auto: false }, ctx.fiber));
  });
}
