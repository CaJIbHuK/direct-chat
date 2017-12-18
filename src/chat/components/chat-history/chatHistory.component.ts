import {Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChildren} from "@angular/core";
import css from "./chatHistory.component.css!text";
import {FileMessage, Message, MessageType} from "../../messages";

@Component({
  selector : 'chat-history',
  template : `<div [ngStyle]="{'color': message.color}" class="message" *ngFor="let message of messages" [ngSwitch]="message.type">
    <span>[{{message.timestamp | date: 'dd-MM-yyyy HH:mm:ss'}}] {{message.author}}:</span>
    <span *ngSwitchCase="messageTypes.TEXT">{{message.text}}</span>
    <span *ngSwitchCase="messageTypes.FILE"><a (click)="downloadFile(message)" class="file-link"
                                               name="{{message.text}}"><i class="fa fa-file"
                                                                          aria-hidden="true"></i>{{message.text}}<span
            class="file-help">(click for download)</span></a></span>
</div>
  `,
  styles : [css]
})
export class ChatHistoryComponent {

  @Input() messages: Message[] = [];
  @Output() onDownloadFile = new EventEmitter();
  messageTypes = MessageType;

  constructor() {}

  downloadFile(message: FileMessage) {
    this.onDownloadFile.emit(message);
  }

}


// function sendData() {
//   var file = fileInput.files[0];
//   trace('File is ' + [file.name, file.size, file.type,
//       file.lastModifiedDate
//     ].join(' '));
//
//   // Handle 0 size files.
//   statusMessage.textContent = '';
//   downloadAnchor.textContent = '';
//   if (file.size === 0) {
//     bitrateDiv.innerHTML = '';
//     statusMessage.textContent = 'File is empty, please select a non-empty file';
//     closeDataChannels();
//     return;
//   }
//   sendProgress.max = file.size;
//   receiveProgress.max = file.size;
//   var chunkSize = 16384;
//   var sliceFile = function(offset) {
//     var reader = new window.FileReader();
//     reader.onload = (function() {
//       return function(e) {
//         sendChannel.send(e.target.result);
//         if (file.size > offset + e.target.result.byteLength) {
//           window.setTimeout(sliceFile, 0, offset + chunkSize);
//         }
//         sendProgress.value = offset + e.target.result.byteLength;
//       };
//     })(file);
//     var slice = file.slice(offset, offset + chunkSize);
//     reader.readAsArrayBuffer(slice);
//   };
//   sliceFile(0);
// }


// function receiveChannelCallback(event) {
//   trace('Receive Channel Callback');
//   receiveChannel = event.channel;
//   receiveChannel.binaryType = 'arraybuffer';
//   receiveChannel.onmessage = onReceiveMessageCallback;
//   receiveChannel.onopen = onReceiveChannelStateChange;
//   receiveChannel.onclose = onReceiveChannelStateChange;
//
//   receivedSize = 0;
//   bitrateMax = 0;
//   downloadAnchor.textContent = '';
//   downloadAnchor.removeAttribute('download');
//   if (downloadAnchor.href) {
//     URL.revokeObjectURL(downloadAnchor.href);
//     downloadAnchor.removeAttribute('href');
//   }
// }
//
// function onReceiveMessageCallback(event) {
//   // trace('Received Message ' + event.data.byteLength);
//   receiveBuffer.push(event.data);
//   receivedSize += event.data.byteLength;
//
//   receiveProgress.value = receivedSize;
//
//   // we are assuming that our signaling protocol told
//   // about the expected file size (and name, hash, etc).
//   var file = fileInput.files[0];
//   if (receivedSize === file.size) {
//     var received = new window.Blob(receiveBuffer);
//     receiveBuffer = [];
//
//     downloadAnchor.href = URL.createObjectURL(received);
//     downloadAnchor.download = file.name;
//     downloadAnchor.textContent =
//       'Click to download \'' + file.name + '\' (' + file.size + ' bytes)';
//     downloadAnchor.style.display = 'block';
//
//     var bitrate = Math.round(receivedSize * 8 /
//       ((new Date()).getTime() - timestampStart));
//     bitrateDiv.innerHTML = '<strong>Average Bitrate:</strong> ' +
//       bitrate + ' kbits/sec (max: ' + bitrateMax + ' kbits/sec)';
//
//     if (statsInterval) {
//       window.clearInterval(statsInterval);
//       statsInterval = null;
//     }
//
//     closeDataChannels();
//   }
// }
//
// function onSendChannelStateChange() {
//   var readyState = sendChannel.readyState;
//   trace('Send channel state is: ' + readyState);
//   if (readyState === 'open') {
//     sendData();
//   }
// }
//
// function onReceiveChannelStateChange() {
//   var readyState = receiveChannel.readyState;
//   trace('Receive channel state is: ' + readyState);
//   if (readyState === 'open') {
//     timestampStart = (new Date()).getTime();
//     timestampPrev = timestampStart;
//     statsInterval = window.setInterval(displayStats, 500);
//     window.setTimeout(displayStats, 100);
//     window.setTimeout(displayStats, 300);
//   }
// }