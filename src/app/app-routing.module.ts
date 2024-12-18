import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PersonListComponent } from './person-list/person-list.component';
import { PersonDetailComponent } from './person-detail/person-detail.component';
import { PersonFormComponent } from './person-form/person-form.component';

const routes: Routes = [
  { path: '', component: PersonListComponent },
  { path: 'person/:id', component: PersonDetailComponent },
  { path: 'add-person', component: PersonFormComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
