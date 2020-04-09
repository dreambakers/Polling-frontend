import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UtilService } from '../../services/util.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  submitted = false;

  constructor(
    private auth: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router,
    private utils: UtilService,
    private userService: UserService) { }

  ngOnInit() {

    if (this.auth.isAuthenticated()) {
      this.router.navigateByUrl('/dashboard/all');
    }

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    this.auth.authenticateUser(this.loginForm.value.email, this.loginForm.value.password).subscribe((response: any) => {
      if (response.headers.get('x-auth')) {
        const user = { ...response.body, authToken: response.headers.get('x-auth') };
        this.userService.setLoggedInUser(user);
        this.router.navigateByUrl('/dashboard/all');
      }

    }, (errorResponse: any) => {
      const errorMessageKey = errorResponse.error.notFound ? 'noUserFound' : 'errorLoggingIn';
      this.utils.openSnackBar(`messages.${errorMessageKey}`, 'labels.retry');
    });
  }
}