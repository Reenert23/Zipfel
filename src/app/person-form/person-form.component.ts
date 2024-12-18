import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PersonService } from '../person.service';
import { Person } from '../person.model';

@Component({
  selector: 'app-person-form',
  templateUrl: './person-form.component.html',
  styleUrls: ['./person-form.component.css']
})
export class PersonFormComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder, private personService: PersonService) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      birthdate: ['', Validators.required],
      department: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const person: Person = this.form.value;
      this.personService.addPerson(person).subscribe(() => {
        this.form.reset();
      });
    }
  }
}
