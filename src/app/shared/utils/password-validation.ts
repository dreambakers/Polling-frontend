import { AbstractControl } from '@angular/forms';

export class PasswordValidation {

    static MatchPassword(AC: AbstractControl) {
        let password = AC.get('password').value;
        let confirmPassword = AC.get('confirmPassword').value;
        if (password != confirmPassword) {
            AC.get('confirmPassword').setErrors({ MatchPassword: true })
        } else {
            return null
        }
    }

    static MatchNewPassword(AC: AbstractControl) {
        let password = AC.get('newPassword').value;
        let confirmPassword = AC.get('newPasswordConfirmation').value;
        if (password != confirmPassword) {
            AC.get('newPasswordConfirmation').setErrors({ MatchPassword: true })
        } else {
            return null
        }
    }
}