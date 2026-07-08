import { Routes } from '@angular/router';
import { UploadPr } from './Pages/upload-pr/upload-pr';
import { PrDetails } from './Pages/pr-details/pr-details';
import { DeliveredPos } from './Pages/delivered-pos/delivered-pos';
import { PoDetails } from './Pages/po-details/po-details';
import { Profile } from './Pages/profile/profile';
import { MyPrsComponent } from './Pages/my-prs/my-prs.component';
import { PrEditDetailsComponent } from './Pages/pr-edit-details/pr-edit-details';

export const routes: Routes = [
  { path: '', redirectTo: 'my-prs', pathMatch: 'full' },
  { path: 'upload-pr', component: UploadPr },
  { path: 'upload-pr/create', component: PrDetails },
  { path: 'delivered-pos', component: DeliveredPos },
  { path: 'delivered-pos/:id', component: PoDetails },
  { path: 'profile', component: Profile },
  { path: 'my-prs', component: MyPrsComponent },
  { path: 'my-prs/edit-details/:id', component: PrEditDetailsComponent },
  { path: '**', redirectTo: 'my-prs' },
];
