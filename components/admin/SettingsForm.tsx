"use client";

import Image from "next/image";
import type { SiteSettings } from "@/lib/db/schema";
import { Field, RowSection, SectionHeader, inputCls, useRows } from "@/components/admin/form-helpers";
import FilePreviewInput from "@/components/admin/FilePreviewInput";
import SubmitButton from "@/components/admin/SubmitButton";
import { UploadStatusProvider } from "@/components/admin/UploadStatusContext";

export default function SettingsForm({
  action,
  settings,
}: {
  action: (formData: FormData) => void;
  settings: SiteSettings;
}) {
  const zones = useRows(settings.deliveryZones.length || 1);

  return (
    <UploadStatusProvider>
    <form action={action} className="max-w-4xl">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="space-y-4 rounded-xl border border-surface-line bg-white p-5">
          <SectionHeader
            title="Branding"
            description="Applies across the whole site immediately — no redeploy needed."
          />
          <Field label="Logo">
            {settings.logoUrl ? (
              <div className="mb-2 flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg bg-surface-muted">
                <Image src={settings.logoUrl} alt="" width={56} height={56} className="object-contain" />
              </div>
            ) : null}
            <input type="hidden" name="currentLogoUrl" value={settings.logoUrl} />
            <FilePreviewInput name="logo" />
          </Field>
          <Field label="Favicon">
            {settings.faviconUrl ? (
              <div className="mb-2 flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-surface-muted">
                <Image src={settings.faviconUrl} alt="" width={40} height={40} className="object-contain" />
              </div>
            ) : null}
            <input type="hidden" name="currentFaviconUrl" value={settings.faviconUrl} />
            <FilePreviewInput name="favicon" />
          </Field>
          <Field label="Primary color">
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="primaryColor"
                defaultValue={settings.primaryColor || "#e21c34"}
                className="h-10 w-14 rounded-md border border-surface-line"
              />
              <span className="text-xs text-ink/50">
                Buttons, prices, and accents site-wide.
              </span>
            </div>
          </Field>
        </section>

        <section className="space-y-4 rounded-xl border border-surface-line bg-white p-5">
          <SectionHeader
            title="Integrations"
            description="Connect or disconnect without touching code."
          />
          <Field label="Facebook Pixel ID">
            <input
              name="fbPixelId"
              placeholder="Leave blank to disable"
              defaultValue={settings.fbPixelId}
              className={`${inputCls} w-full`}
            />
          </Field>
          <Field label="Google Sheets webhook URL">
            <input
              name="googleSheetsWebhookUrl"
              placeholder="Leave blank to disable order syncing"
              defaultValue={settings.googleSheetsWebhookUrl}
              className={`${inputCls} w-full`}
            />
          </Field>
          <Field label="Google Sheets webhook secret">
            <input
              name="googleSheetsWebhookSecret"
              type="password"
              placeholder={settings.googleSheetsWebhookSecret ? "••••••••" : "Leave blank to disable"}
              defaultValue={settings.googleSheetsWebhookSecret}
              className={`${inputCls} w-full`}
            />
          </Field>
        </section>

        <section className="space-y-3 rounded-xl border border-surface-line bg-white p-5">
          <SectionHeader
            title="Contact info"
            description="Shown in the site footer and used for SEO metadata."
          />
          <Field label="Phone numbers — comma separated">
            <input
              name="phones"
              defaultValue={settings.phones.join(", ")}
              className={`${inputCls} w-full`}
            />
          </Field>
          <Field label="Address">
            <textarea
              name="address"
              rows={2}
              defaultValue={settings.address}
              className={`${inputCls} w-full`}
            />
          </Field>
          <Field label="Facebook page URL">
            <input
              name="facebookUrl"
              defaultValue={settings.facebookUrl}
              className={`${inputCls} w-full`}
            />
          </Field>
        </section>

        <RowSection
          title="Delivery zones"
          description="First zone is treated as the “Dhaka” rate; the rest apply everywhere else. Applies site-wide across all products."
          ids={zones.ids}
          onAdd={zones.add}
          onRemove={zones.remove}
          addLabel="+ Add zone"
          renderRow={(i) => (
            <div className="flex items-center gap-3">
              <input
                name="zoneLabel"
                placeholder="Zone label (e.g. ঢাকা)"
                defaultValue={settings.deliveryZones[i]?.label}
                className={`${inputCls} min-w-0 flex-1`}
              />
              <input
                name="zoneCharge"
                type="number"
                min={0}
                placeholder="Charge (৳)"
                defaultValue={settings.deliveryZones[i]?.charge}
                className={`${inputCls} !w-32`}
              />
            </div>
          )}
        />
      </div>

      <div className="sticky bottom-0 mt-5 border-t border-surface-line bg-surface-muted/95 py-4 backdrop-blur">
        <SubmitButton
          label="Save settings"
          className="rounded-lg bg-brand px-6 py-3 font-bold text-white hover:bg-brand-dark disabled:opacity-50"
        />
      </div>
    </form>
    </UploadStatusProvider>
  );
}
