import { Component, OnInit, ViewChild } from '@angular/core';
import { PersonService } from '../person.service';
import { Person } from '../person.model';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';  // Router importieren
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';

export interface TableElement {
  vogl: string;
  paul: string;
  manu: string;
  wolle: string;
}

@Component({
  selector: 'app-person-list',
  templateUrl: './person-list.component.html',
  styleUrls: ['./person-list.component.css']
})
export class PersonListComponent implements OnInit {
  displayedColumns: string[] = ['vogl', 'paul', 'manu', 'wolle'];
  tableData: TableElement[] = [
    { vogl: '', paul: '', manu: '', wolle: '' },
    { vogl: '', paul: '', manu: '', wolle: '' },
    { vogl: '', paul: '', manu: '', wolle: '' },
  ];
  selectedPerson: Person | null = null;
  form: FormGroup;
  buttons = ['+20', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private personService: PersonService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      birthDate: ['', Validators.required],
      department: ['', Validators.required],
    });

  }

  ngOnInit(): void {
   this.loadPersons();
  }

  loadPersons(): void {
    // this.personService.getPersons().subscribe(data => {
    //   this.dataSource.data = data;
    //   this.dataSource.paginator = this.paginator;
    // });
  }

  deletePerson(id: number): void {
    this.personService.deletePerson(id).subscribe(() => {
   //   this.dataSource.data = this.dataSource.data.filter(person => person.id !== id);

      if (this.selectedPerson?.id === id) {
        this.selectedPerson = null;
      }
    });
  }

  onAddPerson(): void {
    if (this.form.valid) {
      const newPerson: Person = this.form.value;
      newPerson.birthDate = formatDate(newPerson.birthDate, 'yyyy-MM-dd', 'en-US');

      // this.personService.addPerson(newPerson).subscribe(addedPerson => {
      //   this.dataSource.data = [...this.dataSource.data, addedPerson];
      //   this.form.reset();
      // });
    }
  }

  viewPersonDetails(id: number) {
    this.personService.getPersonById(id).subscribe(selectedPerson => {
      this.selectedPerson = selectedPerson;
    });
  }

  goToPersonDetail(id: number): void {
    this.router.navigate(['/person', id]);
  }
}
