/*
 * MIT License
 *
 * Copyright (c) 2017-2018 Stefano Cappa
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { of } from 'rxjs/observable/of';
import { delay } from 'rxjs/operators';

import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../core/reducers/hello-example';
import * as example from '../../core/actions/hello-example';

import { ExampleService, MessageResponse } from '../../core/services/example.service';
import { GithubOrg, GithubService } from '../../core/services/github.service';
import { AuthService } from '../../core/services/auth.service';

import { PageHeader } from '../../shared/components/components';

// TODO Socket.io integration is working for client side rendering (both dev and prod),
// but when you switch to SSR there are some problems, so I decided to remove it
// I'll restore these features in future releases
// import * as io from 'socket.io-client';

/**
 * Component with features, template and so on. This is the
 * component used to display the profile page
 */
@Component({
  selector: 'app-profile-page',
  styleUrls: ['profile.scss'],
  templateUrl: 'profile.html'
})
export class ProfileComponent implements OnInit, OnDestroy {
  pageHeader: PageHeader;

  responseFromProtectedApi: string;
  elements: any[] = [{ field: 'el1' }, { field: 'el2' }, { field: 'el3' }];

  helloExample$: Observable<string>;
  elementsObs: Observable<any> = of(this.elements).pipe(delay(1000));

  // TODO Socket.io integration is working for client side rendering (both dev and prod),
  // but when you switch to SSR there are some problems, so I decided to remove it
  // I'll restore these features in future releases
  // socketData: string[] = [];
  // private socket;

  private exampleSubscription: Subscription;
  private githubSubscription: Subscription;

  constructor(
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router,
    private exampleService: ExampleService,
    private githubService: GithubService,
    private store: Store<fromRoot.State>
  ) {
    this.pageHeader = new PageHeader('Welcome', 'to a secret profile page');

    // TODO Socket.io integration is working for client side rendering (both dev and prod),
    // but when you switch to SSR there are some problems, so I decided to remove it
    // I'll restore these features in future releases
    // this.socket = io('http://localhost:4000');
    // this.socket.on('connect', () => {
    //   console.log('connect');
    // });

    // example of ngrx-store's usage
    // If you want, you can subscribe to this Observable to log 'message' saved
    // inside ngrx-store, thanks to this.store.dispatch.
    this.helloExample$ = this.store.select(fromRoot.getHelloExample);

    // TODO Socket.io integration is working for client side rendering (both dev and prod),
    // but when you switch to SSR there are some problems, so I decided to remove it
    // I'll restore these features in future releases
    // this.socket.on('message', (data) => {
    //   console.log('New message received: ' + data);
    //   this.socketData.push(data);
    // });
  }

  sendMessage(message) {
    console.log('Sending a new message: ' + message);
    // this.socket.emit('new-message', message);
  }

  ngOnInit() {
    console.log('Init called - say hello!');
    // dispatch an action to send the 'hello' message
    this.store.dispatch(new example.SayHelloAction());

    // call a REST service with fixed data
    this.exampleSubscription = this.exampleService.getExample().subscribe((resp: MessageResponse) => {
      console.log(`Result of getExample ${resp.message}`);
      this.responseFromProtectedApi = resp.message;
    });

    // call a real REST service by Github
    // This is an example of HttpClient (Angular 4.3.0 or greater)
    this.githubSubscription = this.githubService.getGithubKs89Organizations().subscribe(
      (val: GithubOrg) => {
        console.log('Github organizations of Ks89', val);
      },
      (err: HttpErrorResponse) => {
        console.log('Error while calling Github apis for user Ks89', err);
        if (err.error instanceof Error) {
          // A client-side or network error occurred. Handle it accordingly.
          console.error('An error occurred:', err.error.message);
        } else {
          // The backend returned an unsuccessful response code.
          // The response body may contain clues as to what went wrong,
          console.error(`Backend returned code ${err.status}, body was: ${err.error}`);
        }
      }
    );
  }

  ngOnDestroy() {
    console.log('Destroy called - say bye bye!');

    // dispatch an action to send the 'bye bye' message
    this.store.dispatch(new example.SayByeByeAction());

    // unsubscribe to all Subscriptions to prevent memory leaks and wrong behaviour
    if (this.githubSubscription) {
      this.githubSubscription.unsubscribe();
    }

    if (this.exampleSubscription) {
      this.exampleSubscription.unsubscribe();
    }

    // TODO Socket.io integration is working for client side rendering (both dev and prod),
    // but when you switch to SSR there are some problems, so I decided to remove it
    // I'll restore these features in future releases
    // this.socket.disconnect();
  }
}
