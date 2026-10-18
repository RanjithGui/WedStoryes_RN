import {
  formatDate,
  formatINR,
  Icon,
  NavLink,
  NoEventSelected,
  PageSkeleton,
  parseAmount,
  useSelectedEvent,
  useStoreHydrated,
  WebShell,
} from "@/components/web/ui";
import { DEFAULT_TERMS, STUDIO_OWNER } from "@/constants/quotation";
import { useGlobalStore } from "@/store/globalstore";
import { ClientDetails } from "@/types/types";
import { useRouter } from "expo-router";
import React, { useState } from "react";

type Errors = Partial<Record<"name" | "phone" | "email" | "price" | "discount", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const amountInput = (value: string) => value.replace(/[^\d,]/g, "");

export default function ClientPricingPage() {
  const router = useRouter();
  const hydrated = useStoreHydrated();
  const event = useSelectedEvent();
  const addClientDetails = useGlobalStore((s) => s.addclientdetails);
  const addTerms = useGlobalStore((s) => s.addTerms);
  const addTotalPriceAndDiscount = useGlobalStore((s) => s.addTotalPriceandDiscount);
  const [errors, setErrors] = useState<Errors>({});

  if (!hydrated) {
    return (
      <WebShell step={2} title="Client & pricing">
        <PageSkeleton />
      </WebShell>
    );
  }

  if (!event?.id || event.id === "customevent") {
    return (
      <WebShell step={2} title="Client & pricing">
        <NoEventSelected />
      </WebShell>
    );
  }

  const eventId = event.id;
  const client = event.clientDetails ?? {};
  const price = event.totalPrice ?? "";
  const discount = event.totalDiscount ?? "";
  const terms = event.termsAndConditions ?? DEFAULT_TERMS;
  const subtotal = parseAmount(price);
  const discountValue = parseAmount(discount);
  const total = Math.max(0, subtotal - discountValue);
  const subs = event.eventDetails ?? [];

  // Every field writes straight to the persisted store, so nothing is lost
  // when jumping between steps or reloading the tab.
  const updateClient = (patch: Partial<ClientDetails>, field: keyof Errors) => {
    addClientDetails(eventId, { ...client, ...patch }, STUDIO_OWNER);
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = (): Errors => {
    const next: Errors = {};
    if (!client.name?.trim()) next.name = "Client name is required.";
    if ((client.mobileNumber ?? "").replace(/\D/g, "").length < 7)
      next.phone = "Enter a valid mobile number.";
    if (!EMAIL_RE.test(client.email?.trim() ?? "")) next.email = "Enter a valid email address.";
    if (subtotal <= 0) next.price = "Enter the total package price.";
    if (discountValue > subtotal) next.discount = "Discount can't exceed the total price.";
    return next;
  };

  const submit = () => {
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) {
      document.getElementById(`field-${Object.keys(next)[0]}`)?.focus();
      return;
    }
    addClientDetails(eventId, { ...client, saved: true }, STUDIO_OWNER);
    addTerms(eventId, terms);
    addTotalPriceAndDiscount(eventId, price, discount || "0");
    router.push("/pdfpreview");
  };

  const fieldClass = (key: keyof Errors) => `ws-input ${errors[key] ? "is-invalid" : ""}`;

  return (
    <WebShell step={2} title={`${event.title} · Client & pricing`}>
      <div className="ws-page-head">
        <div>
          <span className="ws-eyebrow">Step 3 · Client & pricing</span>
          <h1 className="ws-title">{event.title}</h1>
          <p className="ws-lede">
            Who the quotation is for, what it costs, and the terms they&apos;re agreeing to.
          </p>
        </div>
      </div>

      <form
        className="ws-layout"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="ws-stack">
          <section className="ws-card ws-card-pad">
            <h2 className="ws-card-title">
              <Icon name="user" /> Client details
            </h2>
            <div className="ws-stack">
              <div className="ws-field">
                <label className="ws-label" htmlFor="field-name">
                  Full name
                </label>
                <input
                  id="field-name"
                  className={fieldClass("name")}
                  autoComplete="name"
                  placeholder="e.g. Priya Sharma"
                  value={client.name ?? ""}
                  onChange={(e) => updateClient({ name: e.target.value }, "name")}
                />
                {errors.name && <span className="ws-error">{errors.name}</span>}
              </div>
              <div className="ws-field-row">
                <div className="ws-field">
                  <label className="ws-label" htmlFor="field-phone">
                    Mobile number
                  </label>
                  <input
                    id="field-phone"
                    type="tel"
                    className={fieldClass("phone")}
                    autoComplete="tel"
                    placeholder="98765 43210"
                    value={client.mobileNumber ?? ""}
                    onChange={(e) => updateClient({ mobileNumber: e.target.value }, "phone")}
                  />
                  {errors.phone && <span className="ws-error">{errors.phone}</span>}
                </div>
                <div className="ws-field">
                  <label className="ws-label" htmlFor="field-email">
                    Email
                  </label>
                  <input
                    id="field-email"
                    type="email"
                    className={fieldClass("email")}
                    autoComplete="email"
                    placeholder="priya@example.com"
                    value={client.email ?? ""}
                    onChange={(e) => updateClient({ email: e.target.value }, "email")}
                  />
                  {errors.email && <span className="ws-error">{errors.email}</span>}
                </div>
              </div>
            </div>
          </section>

          <section className="ws-card ws-card-pad">
            <h2 className="ws-card-title">
              <Icon name="wallet" /> Pricing
            </h2>
            <div className="ws-field-row">
              <div className="ws-field">
                <label className="ws-label" htmlFor="field-price">
                  Total package price
                </label>
                <div className="ws-input-affix">
                  <span>₹</span>
                  <input
                    id="field-price"
                    inputMode="numeric"
                    className={fieldClass("price")}
                    placeholder="3,00,000"
                    value={price}
                    onChange={(e) => {
                      addTotalPriceAndDiscount(eventId, amountInput(e.target.value), discount);
                      setErrors((er) => ({ ...er, price: undefined }));
                    }}
                  />
                </div>
                {errors.price && <span className="ws-error">{errors.price}</span>}
              </div>
              <div className="ws-field">
                <label className="ws-label" htmlFor="field-discount">
                  Discount <small>optional</small>
                </label>
                <div className="ws-input-affix">
                  <span>₹</span>
                  <input
                    id="field-discount"
                    inputMode="numeric"
                    className={fieldClass("discount")}
                    placeholder="0"
                    value={discount}
                    onChange={(e) => {
                      addTotalPriceAndDiscount(eventId, price, amountInput(e.target.value));
                      setErrors((er) => ({ ...er, discount: undefined }));
                    }}
                  />
                </div>
                {errors.discount && <span className="ws-error">{errors.discount}</span>}
              </div>
            </div>
          </section>

          <section className="ws-card ws-card-pad">
            <div className="ws-toolbar" style={{ marginBottom: 16 }}>
              <h2 className="ws-card-title" style={{ margin: 0 }}>
                <Icon name="file" /> Terms & conditions
              </h2>
              {terms !== DEFAULT_TERMS && (
                <button
                  type="button"
                  className="ws-link"
                  onClick={() => addTerms(eventId, DEFAULT_TERMS)}
                >
                  Reset to default
                </button>
              )}
            </div>
            <textarea
              className="ws-textarea"
              aria-label="Terms and conditions"
              rows={Math.min(24, Math.max(10, terms.split("\n").length + 1))}
              value={terms}
              onChange={(e) => addTerms(eventId, e.target.value)}
            />
          </section>
        </div>

        <aside className="ws-aside">
          <div className="ws-card ws-card-pad">
            <h2 className="ws-card-title">
              <Icon name="file" /> Quotation summary
            </h2>
            {subs.length > 0 ? (
              <ul className="ws-mini-list">
                {subs.map((s, i) => (
                  <li key={i}>
                    <span>{s.subEvent}</span>
                    <span>{formatDate(s.date)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="ws-muted" style={{ fontSize: 14 }}>
                No sub-events yet.{" "}
                <NavLink href="/eventdetailsscreen" className="ws-link">
                  Add coverage
                </NavLink>
              </p>
            )}
            <hr className="ws-divider" />
            <div className="ws-summary-row">
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div className="ws-summary-row">
              <span>Discount</span>
              <span>− {formatINR(discountValue)}</span>
            </div>
            <div className="ws-summary-total">
              <span className="ws-muted">Total</span>
              <strong>{formatINR(total)}</strong>
            </div>
            <hr className="ws-divider" />
            <button type="submit" className="ws-btn ws-btn-primary ws-btn-block">
              Preview quotation <Icon name="arrowRight" size={16} />
            </button>
          </div>
          <NavLink href="/eventdetailsscreen" className="ws-btn ws-btn-ghost">
            <Icon name="arrowLeft" size={16} /> Back to coverage
          </NavLink>
        </aside>
      </form>
    </WebShell>
  );
}
