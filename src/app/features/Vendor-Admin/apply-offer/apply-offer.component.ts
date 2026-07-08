import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OffersService, Category, Product, OfferRecord } from '../../../core/services/Vendor-Admin/offers.service';
import { ToastService } from '../../../core/services/Vendor-Admin/toast.service';
import { RfqsService } from '../../../core/services/Vendor-Admin/rfqs.service';

interface OfferForm {
  productId: number;
  itemName: string;
  category: number | string;
  quantity: string;
  unit: string;
  technicalSpecs: string;
  additionalNotes: string;
  cost: string;
  currency: string;
  offerDeadline: string;
  deliveryDeadline: string;
}

@Component({
  selector: 'app-apply-offer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './apply-offer.component.html',
  styleUrls: ['./apply-offer.component.css']
})
export class ApplyOfferComponent implements OnInit {

  rfqId = '';
  rfqTitle = '';
  offerId = '';
  isDraftEdit = false;
  /** True when this page is showing an already-submitted offer for viewing only —
   *  no editing, no re-sending, no re-saving as draft, since the offer is already final. */
  isReadOnly = false;
  offerStatus = '';
  loadingReadOnly = false;
  draftCategoryName = '';
  draftProductName = '';
  categories: Category[] = [];
  products: Product[] = [];
  selectedProductPhotos: string[] = [];
  showSuccess = false;
  successMessage = '';
  /** Tracks which action produced the current success modal, since isDraftEdit
   *  only reflects how the page was opened (editing an existing draft), not
   *  which button was just clicked. Sending an offer should always route to
   *  All Offers, even if it started out as a draft edit. */
  lastAction: 'send' | 'draft' = 'draft';
  /** Field-level validation errors keyed by form field name, shown under each field */
  fieldErrors: { [key: string]: string } = {};

  form: OfferForm = {
    productId: 0,
    itemName: '',
    category: '',
    quantity: '',
    unit: '',
    technicalSpecs: '',
    additionalNotes: '',
    cost: '',
    currency: '',
    offerDeadline: '',
    deliveryDeadline: '',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private offersService: OffersService,
    private rfqsService: RfqsService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const offerIdParam = this.route.snapshot.queryParamMap.get('offerId');

    if (offerIdParam) {
      // Viewing an offer that was already submitted: read-only, no categories/products
      // to fetch since there's nothing to select — we just display the saved values.
      this.isReadOnly = true;
      this.offerId = offerIdParam;
      this.loadingReadOnly = true;
      this.offersService.getOfferDetails(offerIdParam).subscribe({
        next: (res) => {
          this.loadingReadOnly = false;
          if (res.success && res.data) {
            this.populateFormFromRecord(res.data);
          } else {
            this.toastService.error(res.message || 'Could not load this offer.', 'Failed to load offer');
          }
          try { this.cdr.detectChanges(); } catch { /* noop */ }
        },
        error: () => {
          this.loadingReadOnly = false;
          this.toastService.error('Could not load this offer.', 'Failed to load offer');
          try { this.cdr.detectChanges(); } catch { /* noop */ }
        }
      });
      return;
    }

    const navState = history.state as { draft?: OfferRecord };
    const draftId = this.route.snapshot.queryParamMap.get('draftId');
    const loadedDraft = navState?.draft?.status?.toLowerCase() === 'draft'
      ? navState.draft
      : (draftId ? this.offersService.getDraftById(draftId) : undefined);

    if (loadedDraft?.status?.toLowerCase() === 'draft') {
      this.isDraftEdit = true;
      this.offerId = String(loadedDraft.id);
      this.rfqId = String(loadedDraft.rfqId);
      this.rfqTitle = loadedDraft.rfqTitle ?? this.rfqTitle;
      this.form.offerDeadline = this.normalizeDateForInput(loadedDraft.offerDeadline ?? loadedDraft.form?.offerDeadline);
      this.form.deliveryDeadline = this.normalizeDateForInput(loadedDraft.deliveryDeadline ?? loadedDraft.form?.deliveryDeadline);
      this.draftProductName = loadedDraft.productName ?? loadedDraft.form?.itemName ?? '';
      this.form.itemName = this.draftProductName;
      this.draftCategoryName = loadedDraft.categoryName ?? loadedDraft.form?.category?.toString() ?? '';
      this.form.category = loadedDraft.form?.category ?? '';
      this.form.quantity = loadedDraft.quantity != null ? String(loadedDraft.quantity) : loadedDraft.form?.quantity ?? '';
      this.form.unit = loadedDraft.unit ?? loadedDraft.form?.unit ?? '';
      // Accept multiple possible API property names/casings for robustness
      this.form.technicalSpecs = this.pickField(loadedDraft, [
        'technicalSpecs', 'technicalSpecification', 'TechnicalSpecs', 'TechnicalSpecification',
      ]) || this.pickField((loadedDraft as any).form, [
        'technicalSpecs', 'technicalSpecification', 'TechnicalSpecs', 'TechnicalSpecification',
      ]);

      this.form.additionalNotes = this.pickField(loadedDraft, [
        'additionalNotes', 'notes', 'AdditionalNotes', 'Notes',
      ]) || this.pickField((loadedDraft as any).form, [
        'additionalNotes', 'notes', 'AdditionalNotes', 'Notes',
      ]);
      this.form.cost = loadedDraft.cost != null ? String(loadedDraft.cost) : loadedDraft.form?.cost ?? '';
      this.form.currency = loadedDraft.currency ?? loadedDraft.form?.currency ?? '';
      this.form.productId = loadedDraft.productId ?? loadedDraft.form?.productId ?? 0;
      // Debug: show loaded form values
      // eslint-disable-next-line no-console
      console.log('[DEBUG] loadedDraft -> form:', this.form, 'loadedDraft:', loadedDraft);
    } else {
      this.rfqId = this.route.snapshot.paramMap.get('id') ?? '';
    }

    // Fetch RFQ details to get the title
    if (this.rfqId) {
      this.rfqsService.getRfqDetails(this.rfqId).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.rfqTitle = res.data.rfqTitle;
          }
        }
      });
    }

    // Fetch categories
    this.offersService.getCategories().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.categories = res.data;

          if (this.isDraftEdit) {
            const categoryId = Number(this.form.category);
            if (!isNaN(categoryId) && categoryId) {
              this.onCategoryChange(categoryId, true);
            } else if (this.draftCategoryName) {
              const category = this.categories.find(cat => cat.name?.toLowerCase() === this.draftCategoryName.toLowerCase());
              if (category) {
                this.form.category = category.id;
                this.onCategoryChange(category.id, true);
              }
            }
          }
        }
      }
    });
  }

  /** Fills the (disabled) form fields from an already-submitted offer, for read-only viewing. */
  private populateFormFromRecord(record: OfferRecord): void {
    this.rfqId = String(record.rfqId);
    this.rfqTitle = record.rfqTitle ?? this.rfqTitle;
    this.offerStatus = record.status ?? '';
    this.draftProductName = record.productName ?? '';
    this.draftCategoryName = record.categoryName ?? '';
    this.form.itemName = this.draftProductName;
    this.form.category = this.draftCategoryName;
    this.form.quantity = record.quantity != null ? String(record.quantity) : '';
    this.form.unit = record.unit ?? '';
    this.form.technicalSpecs = record.technicalSpecs ?? '';
    this.form.additionalNotes = record.additionalNotes ?? '';
    this.form.cost = record.cost != null ? String(record.cost) : '';
    this.form.currency = record.currency ?? '';
    this.form.offerDeadline = this.normalizeDateForInput(record.offerDeadline);
    this.form.deliveryDeadline = this.normalizeDateForInput(record.deliveryDeadline);
    this.selectedProductPhotos = record.productPhotos ?? [];
  }

  /** Reads the first present, non-empty value among several possible property names/casings */
  private pickField(obj: any, keys: string[]): string {
    if (!obj) return '';
    for (const k of keys) {
      const v = obj[k];
      if (v !== undefined && v !== null && v !== '') return String(v);
    }
    return '';
  }

  private normalizeDateForInput(value?: string | null): string {
    if (!value) return '';
    try {
      if (value.includes('T')) return value.split('T')[0];
      // If value is like "2026-07-14T00:00:00" or other ISO variants, above will work.
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    } catch {
      // ignore
    }
    // Fallback: return as-is if it already matches yyyy-mm-dd pattern
    const m = value.match(/\d{4}-\d{2}-\d{2}/);
    return m ? m[0] : '';
  }

  onCategoryChange(categoryId: number, preserveProduct = false): void {
    console.log('Category changed to ID:', categoryId, 'Type:', typeof categoryId);
    
    this.products = [];
    this.selectedProductPhotos = [];
    if (!preserveProduct) {
      this.form.itemName = '';
    }
    
    if (!categoryId || isNaN(categoryId)) {
      console.warn('Invalid category ID');
      return;
    }

    console.log('Fetching products for category ID:', categoryId);
    // Fetch products for selected category
    this.offersService.getProductsByCategory(categoryId).subscribe({
      next: (res) => {
        console.log('Products API response:', res);
        if (res.success && res.data) {
          this.products = res.data;
          console.log('Products array updated:', this.products);
          if (preserveProduct && this.draftProductName) {
            this.form.itemName = this.draftProductName;
            this.onItemNameChange(this.draftProductName);
          }
        } else {
          console.warn('API returned success=false or no data');
        }
      },
      error: (err) => {
        console.error('Error loading products:', err);
      }
    });
  }

  onItemNameChange(itemName: string): void {
    console.log('Item name changed to:', itemName);
    this.fieldErrors['itemName'] = '';
    const selectedProduct = this.products.find(p => p.itemName === itemName);
    
    if (selectedProduct) {
      this.form.productId = selectedProduct.id;
      this.selectedProductPhotos = selectedProduct.productPhotos || [];
      console.log('Selected product:', selectedProduct);
      console.log('Product ID:', selectedProduct.id);
      console.log('Selected product photos:', this.selectedProductPhotos);
    } else {
      this.form.productId = 0;
      this.selectedProductPhotos = [];
    }
  }

  goToRfqs(): void {
    this.router.navigate(['/vendor-admin/rfqs']);
  }

  goToRfqDetails(): void {
    if (this.isReadOnly) {
      // Coming from an already-submitted offer — RFQ Details shouldn't offer
      // "Apply An Offer" again for this RFQ.
      this.router.navigate(['/vendor-admin/rfqs/rfq-details', this.rfqId], { queryParams: { hasOffer: '1' } });
      return;
    }
    this.router.navigate(['/vendor-admin/rfqs/rfq-details', this.rfqId]);
  }

  goToAllOffers(): void {
    this.router.navigate(['/vendor-admin/my-offers']);
  }

  /** Turns a backend error response (message, or field-level `errors` object) into readable text */
  private extractErrorMessage(err: any): string {
    const body = err?.error ?? err;

    if (body?.errors && typeof body.errors === 'object') {
      const lines: string[] = [];
      for (const field of Object.keys(body.errors)) {
        const entries = body.errors[field];
        const msgs = Array.isArray(entries)
          ? entries.map((e: any) => (typeof e === 'string' ? e : e?.message)).filter(Boolean)
          : [];
        if (msgs.length) lines.push(`${field}: ${msgs.join(', ')}`);
      }
      if (lines.length) return lines.join('\n');
    }

    if (body?.message) return body.message;
    if (typeof body === 'string') return body;
    if (err?.status) return `Server error (${err.status}). Please try again.`;
    return 'Something went wrong. Please try again.';
  }

  onSendOffer(offerForm?: NgForm): void {
    if (offerForm) {
      offerForm.form.markAllAsTouched();
    }

    const validationErrors = this.validatePayloadForServer({
      rfqId: this.rfqId,
      productId: this.form.productId,
      itemName: this.form.itemName,
      category: this.form.category,
      quantity: this.form.quantity,
      unit: this.form.unit,
      technicalSpecification: this.form.technicalSpecs,
      additionalNotes: this.form.additionalNotes,
      cost: this.form.cost,
      currency: this.form.currency,
      offerDeadline: this.formatDateForApi(this.form.offerDeadline),
      deliveryDeadline: this.formatDateForApi(this.form.deliveryDeadline),
    });

    this.fieldErrors = validationErrors;

    // Stop here if there are business-rule errors OR the template's own
    // required/pattern validators are unhappy — don't call the API.
    if (Object.keys(validationErrors).length > 0 || (offerForm && offerForm.invalid)) {
      return;
    }
    const payload = {
      rfqId: this.rfqId,
      productId: this.form.productId,
      itemName: this.form.itemName,
      category: this.form.category,
      quantity: this.form.quantity,
      unit: this.form.unit,
      technicalSpecification: this.form.technicalSpecs,
      additionalNotes: this.form.additionalNotes,
      cost: this.form.cost,
      currency: this.form.currency,
      offerDeadline: this.formatDateForApi(this.form.offerDeadline),
      deliveryDeadline: this.formatDateForApi(this.form.deliveryDeadline),
    };

    console.log('📤 Submitting offer payload:', payload);

    const handleSuccess = (res: { success: boolean; message: string; data?: any }) => {
      console.log('✅ Offer submitted:', res);
      this.fieldErrors = {};
      this.lastAction = 'send';
      this.successMessage = 'Offer sent successfully!';
      this.showSuccess = true;

      // Add to local offers list for immediate UI feedback
      this.offersService.addOffer({
        rfqId: this.rfqId,
        rfqTitle: this.rfqTitle,
        companyName: 'Company Name',
        form: { ...this.form },
      });

      // Local draft copy (if any) is no longer needed now that the offer is submitted.
      if (this.isDraftEdit && this.offerId) {
        this.offersService.removeDraftById(String(this.offerId));
      }
    };

    const handleError = (err: any) => {
      console.error('❌ Error submitting offer:', err);
      this.toastService.error(this.extractErrorMessage(err), 'Failed to send offer');
      // Stay on the page (do not show success, do not fake-save) so the user can fix and retry.
    };

    const doSubmit = () => {
      this.offersService.submitOfferToApi(payload).subscribe({ next: handleSuccess, error: handleError });
    };

    // The backend only allows one offer record per RFQ. If this form started out as an
    // existing draft, that draft row is still sitting in the database and /submit will be
    // rejected with "Offer already exists for this RFQ" unless we clear it out first.
    if (this.isDraftEdit && this.offerId) {
      this.offersService.deleteDraftFromApi(this.offerId).subscribe({
        next: () => doSubmit(),
        error: (err) => {
          console.warn('Failed to delete existing draft before submit, attempting submit anyway:', err);
          doSubmit();
        }
      });
    } else {
      doSubmit();
    }
  }

  /** Returns true if the current form state passes server-side validation rules */
  canSendOrSave(): boolean {
    const payload = {
      rfqId: this.rfqId,
      productId: this.form.productId,
      itemName: this.form.itemName,
      category: this.form.category,
      quantity: this.form.quantity,
      unit: this.form.unit,
      technicalSpecification: this.form.technicalSpecs,
      additionalNotes: this.form.additionalNotes,
      cost: this.form.cost,
      currency: this.form.currency,
      offerDeadline: this.formatDateForApi(this.form.offerDeadline),
      deliveryDeadline: this.formatDateForApi(this.form.deliveryDeadline),
    };
    try {
      const errors = this.validatePayloadForServer(payload);
      return Object.keys(errors).length === 0;
    } catch {
      return false;
    }
  }

  onSaveDraft(offerForm?: NgForm): void {
    console.log('🔵 onSaveDraft clicked!');
    console.log('Form data:', this.form);

    if (offerForm) {
      offerForm.form.markAllAsTouched();
    }

    const payload = {
      rfqId: this.rfqId,
      productId: this.form.productId,
      itemName: this.form.itemName,
      category: this.form.category,
      quantity: this.form.quantity,
      unit: this.form.unit,
      technicalSpecification: this.form.technicalSpecs,
      additionalNotes: this.form.additionalNotes,
      cost: this.form.cost,
      currency: this.form.currency,
      offerDeadline: this.formatDateForApi(this.form.offerDeadline),
      deliveryDeadline: this.formatDateForApi(this.form.deliveryDeadline),
    };
    
    console.log('📤 Sending payload (raw):', payload);

    const validationErrors = this.validatePayloadForServer({
      rfqId: this.rfqId,
      productId: this.form.productId,
      itemName: this.form.itemName,
      category: this.form.category,
      quantity: this.form.quantity,
      unit: this.form.unit,
      technicalSpecification: this.form.technicalSpecs,
      additionalNotes: this.form.additionalNotes,
      cost: this.form.cost,
      currency: this.form.currency,
      offerDeadline: this.formatDateForApi(this.form.offerDeadline),
      deliveryDeadline: this.formatDateForApi(this.form.deliveryDeadline),
    });

    this.fieldErrors = validationErrors;

    // Stop here if there are business-rule errors OR the template's own
    // required/pattern validators are unhappy — don't call the API.
    if (Object.keys(validationErrors).length > 0 || (offerForm && offerForm.invalid)) {
      return;
    }

    const draftPayload = {
      id: this.offerId,
      rfqId: this.rfqId,
      rfqTitle: this.rfqTitle,
      offerDeadline: this.form.offerDeadline,
      deliveryDeadline: this.form.deliveryDeadline,
      companyName: 'Company Name',
      productId: this.form.productId,
      productName: this.form.itemName,
      categoryName: this.categories.find(cat => String(cat.id) === String(this.form.category))?.name ?? String(this.form.category),
      quantity: this.form.quantity ? parseInt(this.form.quantity, 10) : undefined,
      unit: this.form.unit,
      technicalSpecification: this.form.technicalSpecs,
      additionalNotes: this.form.additionalNotes,
      cost: this.form.cost ? parseFloat(this.form.cost) : undefined,
      currency: this.form.currency,
      status: 'Draft',
      form: { ...this.form },
    };

    const persistLocalDraft = () => {
      if (this.isDraftEdit && this.offerId) {
        const updated = this.offersService.updateDraft(draftPayload as Omit<OfferRecord, 'negotiation'> & { id: string });
        if (!updated) {
          // create a local-only draft to avoid id collision with server
          this.offersService.addLocalDraft(draftPayload as Omit<OfferRecord, 'id' | 'negotiation'>);
        }
      } else {
        // New draft: create a local-only draft with non-colliding id so it appears in Drafts immediately
        this.offersService.addLocalDraft(draftPayload as Omit<OfferRecord, 'id' | 'negotiation'>);
      }
    };

    const handleSuccess = (res: { success: boolean; message: string }) => {
      console.log('✅ Draft save response:', res);
      this.fieldErrors = {};
      this.lastAction = 'draft';
      this.successMessage = this.isDraftEdit ? 'Draft updated successfully!' : 'Draft saved successfully!';
      this.showSuccess = true;

      // If server returned an id, persist as a server-backed draft (so delete will call server).
      // Backend may eventually return it in different shapes — check the common ones.
      const data = (res as any)?.data;
      const serverId =
        data?.id ?? data?.offerId ?? data?.draftId ?? data?.offerID ??
        (typeof data === 'number' || typeof data === 'string' ? data : undefined) ??
        (res as any)?.id ?? (res as any)?.offerId ?? undefined;
      if (serverId) {
        const serverDraft: OfferRecord = {
          ...draftPayload,
          id: String(serverId),
          negotiation: 'none',
        } as OfferRecord;
        this.offersService.upsertServerDraft(serverDraft);
      } else {
        // fallback: persist locally (no server id)
        // NOTE: this happens because the draft endpoint's response does not include
        // the created offer's id yet. Once the backend adds it (see /api/VendorOffers/draft
        // response), this branch won't be hit anymore and deletes will reach the server.
        console.warn('[Drafts] Save succeeded but response had no id — storing as local-only draft. Server delete will not work for this item until the backend returns an id.');
        persistLocalDraft();
      }

      this.router.navigate(['/vendor-admin/my-offers/drafts']);
    };

    const handleError = (err: any) => {
      console.error('❌ Error saving draft:', err);
      this.toastService.error(
        this.extractErrorMessage(err),
        this.isDraftEdit ? 'Failed to update draft' : 'Failed to save draft'
      );
      // Stay on the page (do not show success, do not fake-save) so the user can fix and retry.
    };

    if (this.isDraftEdit && this.offerId) {
      this.offersService.updateDraftToApi(this.offerId, payload).subscribe({
        next: handleSuccess,
        error: handleError
      });
    } else {
      // Call the raw draft endpoint with the exact payload shape requested
      this.offersService.saveDraftRaw(payload).subscribe({
        next: handleSuccess,
        error: handleError
      });
    }
  }

  private formatDateForApi(value?: string): string {
    if (!value) return '';
    // If already contains time, return as-is
    if (value.includes('T')) return value;
    // If value is yyyy-mm-dd, append time portion
    const m = value.match(/^(\d{4}-\d{2}-\d{2})$/);
    if (m) return `${m[1]}T00:00:00`;
    try {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d.toISOString();
    } catch {
      // noop
    }
    return value;
  }

  /**
   * Validates the payload and returns a map of fieldName -> error message.
   * Keys correspond to the template's field names so each message can be
   * rendered directly under its field instead of a generic alert().
   */
  private validatePayloadForServer(payload: any): { [key: string]: string } {
    const errors: { [key: string]: string } = {};

    const rfqIdNum = Number(payload.rfqId);
    if (!rfqIdNum || rfqIdNum <= 0) errors['general'] = 'This RFQ could not be identified. Please go back and try again.';

    const prodId = Number(payload.productId);
    if (!prodId || prodId <= 0) errors['itemName'] = 'Please select an item.';

    const qty = Number(payload.quantity);
    if (!qty || qty <= 0) errors['quantity'] = 'Quantity must be greater than zero.';

    const cost = Number(payload.cost);
    if (!cost || cost <= 0) errors['cost'] = 'Cost must be greater than zero.';

    const allowedCurrencies = ['EGP', 'USD', 'EUR', 'SAR'];
    if (!payload.currency || !allowedCurrencies.includes(String(payload.currency))) {
      errors['currency'] = 'Please choose a valid currency.';
    }

    const allowedUnits = ['Piece','Kilogram','Gram','Ton','Liter','Box','Carton','Meter','Pack'];
    if (!payload.unit || !allowedUnits.includes(String(payload.unit))) {
      errors['unit'] = 'Please choose a valid unit.';
    }

    // validate deadlines - both are required by the backend
    const offerDeadline = payload.offerDeadline ? new Date(payload.offerDeadline) : null;
    const deliveryDeadline = payload.deliveryDeadline ? new Date(payload.deliveryDeadline) : null;
    const now = new Date();

    if (!payload.offerDeadline || !offerDeadline || isNaN(offerDeadline.getTime())) {
      errors['offerDeadline'] = 'Offer deadline is required.';
    } else if (offerDeadline <= now) {
      errors['offerDeadline'] = 'Offer deadline must be a future date.';
    }

    if (!payload.deliveryDeadline || !deliveryDeadline || isNaN(deliveryDeadline.getTime())) {
      errors['deliveryDeadline'] = 'Delivery deadline is required.';
    } else if (deliveryDeadline <= now) {
      errors['deliveryDeadline'] = 'Delivery deadline must be a future date.';
    } else if (offerDeadline && !isNaN(offerDeadline.getTime()) && deliveryDeadline <= offerDeadline) {
      errors['deliveryDeadline'] = 'Delivery deadline must be after the offer deadline.';
    }

    return errors;
  }

  onCloseSuccess(): void {
    this.showSuccess = false;
    if (this.lastAction === 'send') {
      this.router.navigate(['/vendor-admin/my-offers']);
    } else {
      this.router.navigate(['/vendor-admin/my-offers/drafts']);
    }
  }
}

