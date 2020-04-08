import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PollService } from 'src/app/services/poll.service';
import { Response } from '../response.model';
import { ResponseService } from 'src/app/services/response.service';
import { UtilService } from 'src/app/services/util.service';
import { constants } from 'src/app/app.constants';
import { Poll } from '../poll.model';

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-manage-poll',
  templateUrl: './manage-poll.component.html',
  styleUrls: ['./manage-poll.component.scss']
})
export class ManagePollComponent implements OnInit {

  response: Response = {
    questions: [],
    for: ''
  };

  poll: Poll;
  pollCopy;
  responses;
  answerMap: any;
  loading = false;
  isEditing = false;
  submitted = false;
  rearrangeQuestions = false;
  constants = constants;

  constructor(
    private router: Router,
    private pollService: PollService,
    private route: ActivatedRoute,
    private responseService: ResponseService,
    private utils: UtilService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.isEditing = this.route.snapshot.routeConfig.path === 'manage';
    if (this.isEditing) {
      this.route.queryParams.subscribe(params => {
        const pollId = params['id'];
        this.pollService.managePoll(pollId).subscribe(
          (res: any) => {
            if (res.success) {
              this.poll = res.poll;
              this.responses = res.responses;
              this.pollCopy = JSON.stringify(this.poll);
            } else {
              this.utils.openSnackBar(this.translate.instant('messages.errorGettingPoll'));
            }
          },
          (err) => {
            this.utils.openSnackBar(this.translate.instant('messages.errorGettingPoll'));
          }
        )
      });
    } else {
      this.poll = {
        questions: [
          { text: '', options: [], answerType: constants.answerTypes.binary }
        ],
        title: '',
        description: '',
        privateNote: '',
        status: constants.statusTypes.open,
        allowComments: false,
        allowNames: false
      }
    }
  }

  createNew() {
    this.router.navigate(['/']);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.poll.questions, event.previousIndex, event.currentIndex);
  }

  addQuestion() {
    this.poll.questions.push({ text: '', options: [], answerType: constants.answerTypes.binary });
  }

  removeQuestion(questionIndex) {
    this.poll.questions.splice(questionIndex, 1);
    if (!this.poll.questions.length) {
      this.addQuestion();
    }
  }

  addOption(questionIndex) {
    this.poll.questions[questionIndex].options.push('');
  }

  removeOption(questionIndex, index) {
    this.poll.questions[questionIndex].options.splice(index, 1);
  }

  trackByFn(index: any, item: any) {
    return index;
  }

  updatePoll() {
    this.poll.questions.forEach(question => delete question['rearrangeOptions']);
    this.pollService.updatePoll(this.poll).subscribe(
      (res: any) => {
        if (res.success) {
          this.utils.openSnackBar(this.translate.instant('messages.pollUpdated'), this.translate.instant('labels.success'));
          this.pollCopy = JSON.stringify(this.poll);
        } else {
          this.utils.openSnackBar(this.translate.instant('messages.errorUpdatingPoll'));
        }
      },
      err => {
        this.utils.openSnackBar(this.translate.instant('messages.errorUpdatingPoll'));
      }
    );
  }

  createPoll() {
    this.pollService.addPoll(this.poll).subscribe((res: any) => {
      this.utils.openSnackBar(this.translate.instant('messages.pollCreated'), this.translate.instant('labels.success'));
      this.router.navigate(['/dashboard/manage'], { queryParams: { id: res.poll._id } });
    }, err => {
      this.utils.openSnackBar(this.translate.instant('messages.errorCreatingPoll'));
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
    this.poll.questions.forEach(question => delete question['rearrangeOptions']);
  }

  minimumOptionsRequired(question) {
    return question.answerType === constants.answerTypes.radioButton ||
           question.answerType === constants.answerTypes.checkbox;
  }

  rearrangeOptions(question) {
    if (question['rearrangeOptions']) {
      delete question['rearrangeOptions'];
    } else {
      question['rearrangeOptions'] = true;
    }
  }

  onCancelClicked(){
    const key = this.isEditing ? 'cancelPollEdit' : 'cancelPollCreation';
    this.utils.confirmDialog('messages.areYouSure', `messages.${key}`).subscribe(
      res => {
        if (res) {
          this.router.navigate(['/dashboard/all']);
        }
      }
    );
  }

  get isValid() {
    return this.poll.title &&
           this.poll.questions.every(question => question.text && question.options.every(option => option.length)) &&
           this.poll.questions.filter(question => this.minimumOptionsRequired(question)).every(question => question.options.length >= 2);
  }

  get dirty() {
    return JSON.stringify(this.poll) !== this.pollCopy;
  }

  get shouldDisable() {
    if (this.isEditing) {
      return this.poll.status === constants.statusTypes.terminated || this.responses.length > 0;
    } else {
      return false;
    }
  }
}
