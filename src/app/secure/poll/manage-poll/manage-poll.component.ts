import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PollService } from '../../../services/poll.service';
import { Response } from '../response.model';
import { UtilService } from '../../../services/util.service';
import { constants } from '../../../app.constants';
import { Poll } from '../poll.model';

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '../../../services/data.service';
import { EmitterService } from '../../../services/emitter.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DialogService } from '../../../services/dialog.service';
import { ScrollService } from '../../../services/scroll.service';
import { UserService } from '../../../services/user.service';
import { MobileNavbarProps } from '../../mobile-nav/mobile-nav.component';

@Component({
  selector: 'app-manage-poll',
  templateUrl: './manage-poll.component.html',
  styleUrls: ['./manage-poll.component.scss']
})
export class ManagePollComponent implements OnInit, OnDestroy {

  response: Response = {
    questions: [],
    for: ''
  };
  collapsed = { /* 1 : false */ }; // map of indices of collapsed questions
  user;
  poll: Poll;
  pollCopy;
  answerMap: any;
  hide = true;
  preview = false;
  loading = false;
  isEditing = false;
  submitted = false;
  showPassword = false;
  showBasicHints = false;
  rearrangeQuestions = false;
  constants = constants;
  mobileNavbarProps: MobileNavbarProps;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private router: Router,
    private pollService: PollService,
    private route: ActivatedRoute,
    private utils: UtilService,
    public translate: TranslateService,
    private emitterService: EmitterService,
    private dialogService: DialogService,
    private scrollService: ScrollService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.scrollService.top();
    this.user = this.userService.getLoggedInUser();
    this.user = this.userService.getLoggedInUser();
    this.isEditing = this.route.snapshot.routeConfig.path === 'manage';
    if (this.isEditing) {
      this.emitterService.emit(this.constants.emitterKeys.updateNavbarLabels, { create: 'labels.update' });
      this.route.queryParams.subscribe(params => {
        const pollId = params['id'];
        this.pollService.managePoll(pollId).subscribe(
          (res: any) => {
            if (res.success) {
              this.poll = res.poll;
              this.showPassword = !!this.poll.password;
              this.pollCopy = JSON.stringify(this.poll);
              this.poll.questions.forEach((q, i) => { this.collapsed[i] = true; });
              this.updateMobileNavbar();
              if (this.poll.responses >= 1) {
                this.emitterService.emit(constants.emitterKeys.changeNavbarTitle, {
                  extra: ` (${this.poll.responses})`
                });
              }
            } else {
              this.utils.openSnackBar('errors.e003_gettingSurvey');
            }
          },
          (err) => {
            this.utils.openSnackBar('errors.e003_gettingSurvey');
          }
        )
      });
    } else {
      this.poll = {
        questions: [
          { text: '', options: [], answerType: constants.answerTypes.yesNoMaybe }
        ],
        title: '',
        status: constants.statusTypes.open,
        allowComments: false,
        allowNames: false,
        automaticNumbering: true
      }
      this.updateMobileNavbar();
    }
    this.emitterService.emitter.pipe(takeUntil(this.destroy$)).subscribe((emitted) => {
      switch(emitted.event) {
        case constants.emitterKeys.add:
          return this.addQuestion();
        case constants.emitterKeys.home:
          return this.onCancelClicked();
        case constants.emitterKeys.preview:
          return this.togglePreview();
        case constants.emitterKeys.create:
          return this.isEditing ? this.updatePoll() : this.createPoll();
        case constants.emitterKeys.arrange:
          return this.toggleRearrangement();
        case constants.emitterKeys.importSurveyData:
          return this.poll = emitted.data;
      }
    });
    const key = this.isEditing ? 'labels.manageSurvey' : 'labels.createSurvey';
    this.emitterService.emit(constants.emitterKeys.changeNavbarTitle, { key });
    this.emitterService.emit(this.constants.emitterKeys.updateNavbarLabels, { add: 'labels.addQuestionMobile' });
  }

  updateMobileNavbar() {
    this.mobileNavbarProps = {
      home: true,
      arrange: !this.preview &&
                (this.rearrangeQuestions
                  || (this.poll.questions.length > 1 && this.isMobile && !this.shouldDisable)),
      add: !this.preview && !this.shouldDisable,
      create: false,
      preview: !this.rearrangeQuestions && true
    }
    this.emitterService.emit(constants.emitterKeys.updateNavbarProps, this.mobileNavbarProps);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.poll.questions, event.previousIndex, event.currentIndex);
  }

  addQuestion() {
    this.poll.questions.push({ text: '', options: [], answerType: constants.answerTypes.yesNoMaybe });
    this.updateMobileNavbar();
    this.scrollService.toElement(`#question${this.poll.questions.length - 1}`);
  }

  removeQuestion(questionIndex) {
    this.poll.questions.splice(questionIndex, 1);
    if (!this.poll.questions.length) {
      this.addQuestion();
    }
    this.updateMobileNavbar();
  }

  addOption(question) {
    question.options.push('');
    this.updatesLimitForCheckboxAnswer(question);
  }

  removeOption(question, index) {
    question.options.splice(index, 1);
    !question.options.length && (question.editMode = false);
    this.updatesLimitForCheckboxAnswer(question);
  }

  trackByFn(index: any, item: any) {
    return index;
  }

  updatePoll() {
    this.poll.questions.forEach(question => delete question['rearrangeOptions']);
    this.pollService.updatePoll(this.poll).subscribe(
      (res: any) => {
        if (res.success) {
          this.utils.openSnackBar('messages.surveyUpdated', 'labels.success');
          this.pollCopy = JSON.stringify(this.poll);
        } else {
          this.utils.openSnackBar('errors.e002_updatingSurvey');
        }
      },
      err => {
        this.utils.openSnackBar('errors.e002_updatingSurvey');
      }
    );
  }

  createPoll() {
    this.pollService.addPoll(this.poll).subscribe((res: any) => {
      this.utils.openSnackBar('messages.surveyCreated', 'labels.success');
      this.router.navigate(['/dashboard/manage'], { queryParams: { id: res.poll._id } });
    }, err => {
      this.utils.openSnackBar('errors.e001_creatingSurvey');
    });
  }

  dropQuestion(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.poll.questions, event.previousIndex, event.currentIndex);
  }

  dropOption(event: CdkDragDrop<string[]>, question) {
    moveItemInArray(question.options, event.previousIndex, event.currentIndex);
  }

  toggleRearrangement() {
    this.rearrangeQuestions = !this.rearrangeQuestions;
    this.updateMobileNavbar();
    this.deleteEditKeys();
  }

  onCancelClicked(){
    if (this.isEditing && !this.dirty) {  // don't show confirmation in case poll wasn't udpated
      return this.router.navigate(['/dashboard/all']);
    }
    const key = this.isEditing ? 'cancelSurveyEdit' : 'cancelSurveyCreation';
    this.dialogService.confirm('messages.areYouSure', `messages.${key}`).subscribe(
      res => {
        if (res) {
          this.router.navigate(['/dashboard/all']);
        }
      }
    );
  }

  togglePassword() {
    this.poll.password = '';
    this.showPassword = !this.showPassword;
  }

  valueFieldsValid(question) {
    return question.minValue !== undefined ||
           question.maxValue !== undefined ||
           question.decimalPlaces !== undefined ||
           +question.maxValue > +question.minValue;
  }

  questionInfoRequired(question) {
    return [
      constants.answerTypes.checkbox,
      constants.answerTypes.radioButton,
      constants.answerTypes.value,
      constants.answerTypes.list
    ].includes(question.answerType);
  }

  getInfoTooltipKey(question) {
    switch (question.answerType) {
      case constants.answerTypes.checkbox:
      case constants.answerTypes.radioButton:
        return 'tooltips.minTwoOptions';

      case constants.answerTypes.value:
        return 'tooltips.valueInfo';

      case constants.answerTypes.list:
        return 'tooltips.listInfo';
    }
  }

  togglePreview() {
    this.preview = !this.preview;
    if (this.preview) {
      this.emitterService.emit(constants.emitterKeys.changeNavbarTitle, {
        key: 'labels.surveyPreview',
      });
    } else {
      this.emitterService.emit(constants.emitterKeys.changeNavbarTitle, {
        key: this.isEditing ? 'labels.manageSurvey' : 'labels.createSurvey',
      });
    }
    this.updateMobileNavbar();
    this.deleteEditKeys();
  }

  @HostListener("window:scroll", ["$event"])
  onWindowScroll() {
  }

  getFabPosition() {
    return '20px';
    // dynamic position of FAB according to scroll position
    // commented because footer is currently hidden from the desktop layout

    // let pos = (document.documentElement.scrollTop || document.body.scrollTop) + document.documentElement.offsetHeight;
    // let max = document.documentElement.scrollHeight;
    // this.remainingScroll = max - pos;
    // if (65 - this.remainingScroll < 10) {
    //   return '20px'
    // }
    // return `${65 - this.remainingScroll}px`
  }

  isQuestionValid(question) {
    switch (question.answerType) {
      case constants.answerTypes.checkbox:
      case constants.answerTypes.radioButton:
        return question.options.length >= 2;

      case constants.answerTypes.value:
        return this.valueFieldsValid(question);

      case constants.answerTypes.list:
        return !!question.listElements;
    }
    return true;
  }

  getAddOptionLabel(question) {
    return question.options.length ? 'labels.addAnotherOption' : 'labels.addOption';
  }

  deleteEditKeys() {
    this.poll.questions.forEach(question => delete question.editMode);
  }

  toggleLimit(question) {
    if (question.limits) {
      delete question.limits;
    } else {
      question.limits = {
        minChecks: 1,
        maxChecks: question.options.length
      }
    }
  }

  getMinimumChecksDropdownValues(question) {
    let options = [1];
    for (let i = 2; i <= question.options.length; i ++) {
      options.push(i);
    }
    return options;
  }

  getMaximumChecksDropdownValues(question) {
    let options = [];
    for (let i = question.limits.minChecks; i <= question.options.length; i ++) {
      options.push(i);
    }
    return options;
  }

  updatesLimitForCheckboxAnswer(question) {
    if (question.answerType === constants.answerTypes.checkbox) {
      if (question.options.length <= 2) {
        delete question.limits;
      } else {
        if (question.limits) {
          question.limits.maxChecks = question.options.length;
        }
      }
    }
  }

  toggleQuestionEditMode(question) {
    if (question.options.length || question.editMode) {
      question.editMode = !question.editMode;
    }
  }

  toggleAdditionalText(question) {
    if ('additionalText' in question) {
      return delete question.additionalText;
    }
    question.additionalText = '';
  }

  keyIn(key, object) {
    return key in object;
  }

  ngOnDestroy(): void {
    this.emitterService.emit(this.constants.emitterKeys.resetNavbar);
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  get isValid() {
    const valid = !this.user.readonly &&
                  this.poll.title && (this.showPassword ? this.poll.password : true) &&
                  this.poll.questions.filter(question => question.limits).every(question => question.limits.maxChecks >= question.limits.minChecks) &&
                  this.poll.questions.every(question => question.text && question.options.every(option => option.length)) &&
                  this.poll.questions.filter(question => [constants.answerTypes.radioButton, constants.answerTypes.checkbox].includes(question.answerType)).every(question => question.options.length >= 2) &&
                  this.poll.questions.filter(question => question.answerType === constants.answerTypes.value).every(question => this.valueFieldsValid(question)) &&
                  this.poll.questions.filter(question => question.answerType === constants.answerTypes.list).every(question => question.listElements);
    this.mobileNavbarProps.create = this.isEditing ? valid && this.dirty : valid;
    this.emitterService.emit(this.constants.emitterKeys.updateNavbarProps, this.mobileNavbarProps);
    return valid;
  }

  get dirty() {
    return JSON.stringify(this.poll) !== this.pollCopy;
  }

  get shouldDisable() {
    if (this.isEditing) {
      return this.poll.responses > 0;
    } else {
      return false;
    }
  }

  get isMobile() {
    return DataService.isMobile;
  }
}
