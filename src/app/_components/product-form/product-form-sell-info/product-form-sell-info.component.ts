import { Component, OnInit, OnChanges, SimpleChange } from '@angular/core';

export interface ITierVariation {
  options: string[];
  name: string;
}

export interface IModel {
  price: number;
  stock: number;
  sku: string;
  name: string;
  id_tier: string;
}

@Component({
  selector: 'app-product-form-sell-info',
  templateUrl: './product-form-sell-info.component.html',
  styleUrls: ['./product-form-sell-info.component.scss'],
})
export class ProductFormSellInfoComponent implements OnInit {
  tier_variations: ITierVariation[] = [
    {
      name: '',
      options: [''],
    },
  ];
  modelsPreview = [];
  models: IModel[] = [
    {
      id_tier: '0-0',
      name: '',
      price: null,
      stock: null,
      sku: '',
    },
  ];
  constructor() {}

  ngOnInit(): void {}

  renderModelPreview(e: string, id: string) {
    console.log(e, id);
    const ind = this.models.findIndex((x) => x.id_tier === id);
    if (ind > -1) {
      this.models[ind].name = e;
    }
    // (this.tier_variations[0]?.options || []).forEach(
    //   (e1: string, i: number) => {
    //     const obj = {
    //       name: e1,
    //       id: i + '-0',
    //       price: null,
    //       stock: null,
    //       sku: '',
    //     };
    //     if (this.tier_variations[1]) {
    //       this.tier_variations[1].options.forEach((e2: string, ii: number) => {
    //         const id = i + '-' + ii;
    //         const ind = this.modelsPreview.findIndex((x) => x.id === id);
    //         obj.name = e1 + ', ' + e2;
    //         if (ind === -1) {
    //           this.modelsPreview.push(obj);
    //         } else {
    //           this.modelsPreview[ind] = {
    //             ...this.modelsPreview[ind],
    //             name: obj.name,
    //           };
    //         }
    //       });
    //     } else {
    //       const id = i + '-0';
    //       const ind = this.modelsPreview.findIndex((x) => x.id === id);
    //       obj.name = e1;
    //       if (ind === -1) {
    //         this.modelsPreview.push(obj);
    //       } else {
    //         this.modelsPreview[ind] = {
    //           ...this.modelsPreview[ind],
    //           name: obj.name,
    //         };
    //       }
    //       this.modelsPreview.push(obj);
    //     }
    //   }
    // );
  }
  test() {}

  addModel(id_tier: string) {
    this.models.push({
      id_tier,
      name: '',
      price: null,
      stock: null,
      sku: '',
    });
  }

  removeModel(id_tier: string) {
    const ind = this.models.findIndex((x) => x.id_tier === id_tier);
    if (ind > -1) {
      this.models.splice(ind, 1);
    }
  }

  addTier() {
    this.tier_variations.push({
      name: '',
      options: [''],
    });
    this.addModel('1-0');
    setTimeout(() => {
      document
        .getElementById('tier-' + (this.tier_variations.length - 1))
        .focus();
    }, 500);
  }

  addOption(tier_i: number) {
    this.tier_variations[tier_i].options.push('');
    this.addModel(
      tier_i + '-' + (this.tier_variations[tier_i].options.length - 1)
    );
    setTimeout(() => {
      const id =
        'option-' +
        tier_i +
        '-' +
        (this.tier_variations[tier_i].options.length - 1);
      document.getElementById(id).focus();
    }, 500);
  }

  removeOption(tier_i: number, option_i: number) {
    this.tier_variations[tier_i].options.splice(option_i, 1);
    this.removeModel(tier_i + '-' + option_i);
  }
  removeTier(tier_i: number) {
    this.tier_variations.splice(tier_i, 1);
  }
  ngModelChange(e) {}
  trackByFn(index: any, item: any) {
    return index;
  }
}
