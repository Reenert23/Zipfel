import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PersonService } from '../person.service';
import { Person } from '../person.model';

@Component({
  selector: 'app-person-detail',
  templateUrl: './person-detail.component.html',
  styleUrls: ['./person-detail.component.css']
})
export class PersonDetailComponent implements OnInit {
  person!: Person;

  constructor(
    private route: ActivatedRoute,
    private personService: PersonService
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.personService.getPersonById(id).subscribe(person => {
      console.log("person: ", person);
      this.person = person;

    });

  }
}
