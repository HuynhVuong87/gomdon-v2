import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

export interface IProGe {
  product_name: string;
  product_describe: string;
}

@Component({
  selector: 'app-product-form-general',
  templateUrl: './product-form-general.component.html',
  styleUrls: ['./product-form-general.component.scss'],
})
export class ProductFormGeneralComponent implements OnInit {
  validateForm!: FormGroup;
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      product_name: [null, [Validators.required, Validators.minLength(10)]],
      product_describe: [
        null,
        [Validators.required, Validators.maxLength(3000)],
      ],
    });
  }

  submitForm(): IProGe {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    if (this.validateForm.valid) {
      const { product_name, product_describe } = this.validateForm.value;
      return {
        product_name,
        product_describe,
      };
    }
  }
}
