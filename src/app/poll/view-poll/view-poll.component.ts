import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PollService } from 'src/app/services/poll.service';
import { StarRatingColor } from 'src/app/star-rating/star-rating.component';
import { Response } from '../response.model';
import { ResponseService } from 'src/app/services/response.service';
import { UtilService } from 'src/app/services/util.service';
import { constants } from 'src/app/app.constants';
import { UserService } from 'src/app/services/user.service';
import { TranslateService } from '@ngx-translate/core';

import { take } from 'rxjs/operators'

@Component({
  selector: 'app-view-poll',
  templateUrl: './view-poll.component.html',
  styleUrls: ['./view-poll.component.scss']
})
export class ViewPollComponent implements OnInit {

  @Input()
  response: Response = {
    questions: [],
    for: ''
  };
  responseCopy;

  @Input() poll;
  @Input() hasResponded = false;
  @Input() embeddedPreview = false;

  rating: number = 0;
  starCount: number = 5;
  starColor: StarRatingColor = StarRatingColor.accent;
  starColorP: StarRatingColor = StarRatingColor.primary;
  starColorW: StarRatingColor = StarRatingColor.warn;

  pollId;
  hide = true;
  password = '';
  preview = false;
  passwordRequired = false;
  constants = constants;

  constructor(
    private router: Router,
    private pollService: PollService,
    private route: ActivatedRoute,
    private responseService: ResponseService,
    private utils: UtilService,
    private userService: UserService,
    public translate: TranslateService
  ) { }

  ngOnInit() {
    if (this.poll) {
      this.preview = true;
      !this.hasResponded && this.setAnswers();
    } else {
      this.route.queryParams.pipe(take(1)).subscribe(params => {
        this.pollId = params['id'];
        if (this.pollId) {
          this.getPoll(this.pollId);
        } else {
          this.router.navigate(['']);
        }
      });
    }
  }

  getPoll(pollId, password = null) {
    this.pollService.getPoll(pollId, password).subscribe(
      (res: any) => {
        if (res.success) {
          this.passwordRequired = false;
          this.poll = res.poll;
          if (this.getResponseFromLocalStorage(this.poll._id)) {
            this.response = this.getResponseFromLocalStorage(this.poll._id);
            this.hasResponded = true;
          } else {
            this.setAnswers();
            this.response.for = res.poll._id;
          }
          this.responseCopy = JSON.stringify(this.response);
        } else {
          if (res.passwordRequired) {
            this.passwordRequired = true;
          } else if (res.incorrectPassword) {
            this.utils.openSnackBar('messages.incorrectPassword', 'labels.retry');
          } else {
            this.utils.openSnackBar('messages.errorGettingPoll');
          }
        }
      },
      (err) => {
        this.utils.openSnackBar('messages.errorGettingPoll');
      }
    );
  }

  setAnswers(response = null) {
    const getDefaultAnswer = (answerType) => {
      switch (answerType) {
        case constants.answerTypes.checkbox:
        case constants.answerTypes.radioButton:
          return false;
        case constants.answerTypes.radioButton:
        case constants.answerTypes.slider:
          return 0;
        default:
          return '';
      }
    }
    this.poll.questions.forEach(question => {
      this.response.questions.push({
        _id: question._id || null,
        text: question.text,
        answers: question.options.map(option => ({ option, answer: getDefaultAnswer(question.answerType) })),
        answerType: question.answerType
      });
    });
    this.poll.allowComments && (this.response['comments'] = '');
    this.poll.allowNames && (this.response['name'] = '');
  }

  vote() {
    if (this.hasResponded) {
      this.responseService.updateResponse(this.response).subscribe((res: any) => {
        if (res.success) {
          this.utils.openSnackBar('messages.responseUpdated', 'labels.success');
          this.addResponseToLocalStorage(res.response);
          this.responseCopy = JSON.stringify(res.response);
          this.response = res.response;
        }
      }, err => {
        this.utils.openSnackBar('messages.errorUpdatingResponse');
      });
    } else {
      this.responseService.recordResponse(this.response).subscribe((res: any) => {
        if (res.success) {
          this.utils.openSnackBar('messages.responseRecorded', 'labels.success');
          this.addResponseToLocalStorage(res.response);
          this.responseCopy = JSON.stringify(res.response);
          this.response = res.response;
          this.hasResponded = true;
        }
      }, err => {
        this.utils.openSnackBar('messages.errorRecordingResponse');
      });
    }
  }

  onRatingChanged(rating, questionIndex, answerIndex = null) {
    const question = this.response.questions[questionIndex];
    question.answerType = constants.answerTypes.rating;
    if (answerIndex !== null) {
      question.answers[answerIndex].answer = rating.toString();
    } else {
      question['answer'] = rating.toString();
    }
  }

  onBinaryAnswerChanged(event, questionIndex, answerIndex = null) {
    const question = this.response.questions[questionIndex];
    question.answerType = constants.answerTypes.binary;
    if (answerIndex !== null) {
      question.answers[answerIndex].answer = event.value;
    } else {
      question['answer'] = event.value;
    }
  }

  onYNMAnswerChanged(event, questionIndex, answerIndex = null) {
    const question = this.response.questions[questionIndex];
    question.answerType = constants.answerTypes.yesNoMaybe;
    if (answerIndex !== null) {
      question.answers[answerIndex].answer = event.value;
    } else {
      question['answer'] = event.value;
    }
  }

  onSmileyAnswerChanged(event, questionIndex, answerIndex = null) {
    const question = this.response.questions[questionIndex];
    question.answerType = constants.answerTypes.smiley;
    if (answerIndex !== null) {
      question.answers[answerIndex].answer = event.value;
    } else {
      question['answer'] = event.value;
    }
  }

  onSliderValueChanged(event, questionIndex, answerIndex = null) {
    const question = this.response.questions[questionIndex];
    question.answerType = constants.answerTypes.slider;
    if (answerIndex !== null) {
      question.answers[answerIndex].answer = event.value;
    } else {
      question['answer'] = event.value;
    }
  }

  onCheckboxChanged(event, questionIndex, answerIndex = null) {
    const question = this.response.questions[questionIndex];
    question.answerType = constants.answerTypes.checkbox;
    if (answerIndex !== null) {
      question.answers[answerIndex].answer = event.checked;
    } else {
      question['answer'] = event.checked;
    }
  }

  onRadioButtonChanged(questionIndex, answerIndex = null) {
    const question = this.response.questions[questionIndex];
    question.answerType = constants.answerTypes.radioButton;
    if (answerIndex !== null) {
      question.answers.forEach((answerObject, index) => {
        if (index !== answerIndex) {
          answerObject.answer = false;
        } else {
          answerObject.answer = true;
        }
      })
    } else {
      question['answer'] = true;
    }
  }

  getOptions(question) {
    if (this.hasResponded) {
      return question.answers;
    } else {
      return question.options;
    }
  }

  getResponseFromLocalStorage(pollId) {
    const responses = JSON.parse(localStorage.getItem('responses')) || [];
    return responses.find(response => response.for === pollId);
  }

  addResponseToLocalStorage(newResponse) {
    const responses = JSON.parse(localStorage.getItem('responses')) || [];
    const index = responses.findIndex(response => response.for === newResponse.for);

    if (index >= 0) {
      responses[index] = newResponse;
    } else {
      responses.push(newResponse);
    }
    localStorage.setItem('responses', JSON.stringify(responses));
  }

  goClicked() {
    this.getPoll(this.pollId, this.password);
  }

  navigateToRespond() {
    this.router.navigate(['/respond'], {
      relativeTo: this.route,
      queryParams: {
        id: this.pollId
      }
   });
  }

  get canVote() {
    const totalOptions = this.poll.questions.reduce((acc, question) => {
      if (question.answerType !== constants.answerTypes.slider) {
        if (question.options.length) {
          // dont count multiple options for checkbox/radio (since a min of 1 must be selected)
          if ([constants.answerTypes.radioButton, constants.answerTypes.checkbox].includes(question.answerType)) {
            acc += 1;
          } else {
            acc += question.options.length;
          }
        } else {
          acc += 1;
        }
      }
      return acc;
    }, 0);

    const respondedCount = this.response.questions.reduce((acc, question) => {
      if (question.answerType !== constants.answerTypes.slider) {
        if (question.answers.length) {
          if ([
                constants.answerTypes.radioButton,
                constants.answerTypes.checkbox
              ].includes(question.answerType)
              && question.answers.filter(answerObj => answerObj.answer).length) {
            acc ++;
          } else {
            acc += question.answers.filter(answerObj => answerObj.answer).length;
          }
        } else {
          if (question.answer) {
            acc++;
          }
        }
      }
      return acc;
    }, 0);

    return totalOptions === respondedCount;
  }

  get dirty() {
    return JSON.stringify(this.response) !== this.responseCopy;
  }

  get shouldDisable() {
    return this.poll.status === constants.statusTypes.terminated;
  }

}