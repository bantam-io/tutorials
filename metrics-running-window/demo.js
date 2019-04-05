window.addEventListener('load', function() {
  bantam.configure({
    apiKey: 'apikey',
  });

  var userUploadStartTime = '',
    userUploadEndTime = '',
    fileUploadStartTime = '',
    fileUploadEndTime = '';
  // bantam upload image function
  window.uploadAndShowFile = function uploadAndShowFile(type) {
    // userUploadStartTime = new Date().getTime();
    // document.querySelector('#userStartTime').innerHTML = userUploadStartTime;
    selectFile(type).then(
      res => {
        console.log('result url', res.url);
        console.log('result metadata', res.metadata);

        document.querySelector('#border').style['border'] = `10px solid #888`;
        document.querySelector('#full').hidden = false;
        document.querySelector('#results').hidden = false;
      },
      e => {
        console.error('error', e);
      }
    );
  };

  window.pushRunningWindow = function pushRunningWindow(
    category,
    name,
    type,
    value,
    window
  ) {
    // type can be value or rate
    console.log('pushRunningWindow');
    bantam.run('@metrics/running-window/push', {
      category: category,
      name: name,
      type: type,
      value: value,
      window: window,
    });
  };

  window.pullMetrics = function pullMetrics(category, name, type, period) {
    console.log('bantam retrieve metrics');
    bantam
      .run('@metrics/running-window/retrieve', {
        category: category,
        name: name,
        type: type,
        period: period,
      })
      .then(res => {
        document.querySelector(
          `#metric-results-${name}`
        ).innerHTML = JSON.stringify(res);
        console.log('metric results: ', res);
      });
  };
  window.getMetrics = function getMetrics() {
    console.log('retrieve metrics');
    pullMetrics('upload-image', 'user', 'value', 1);
    pullMetrics('upload-image', 'upload', 'value', 1);
  };

  window.selectFile = function selectFile(type) {
    document.querySelector('#Times').hidden = false;
    userUploadStartTime = new Date().getTime();
    document.querySelector('#userStartTime').innerHTML = userUploadStartTime;
    function fullScreenLoading() {
      const loader = document.createElement('div');

      loader.classList.add('FullScreenLoading');
      loader.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';
      document.body.appendChild(loader);
      return {
        dismiss: () => {
          loader.remove();
        },
      };
    }
    console.log('selected file: ', type);
    return new Promise(function(resolve, reject) {
      console.log('select Image');
      selectLocalImage();

      function selectLocalImage() {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        if (type) {
          input.setAttribute('accept', type);
        }

        input.addEventListener('change', function() {
          uploadFile(input);
        });

        input.click();
      }

      function uploadFile(input) {
        const loader = fullScreenLoading();
        console.log('setFileUploadStartTime');
        fileUploadStartTime = new Date().getTime();
        bantam
          .file(input)
          .upload()
          .then(
            res => {
              console.log('fileEndUploadTime');
              fileUploadEndTime = new Date().getTime();
              userUploadEndTime = new Date().getTime();
              document.querySelector('#full').src = res.url;
            },
            e => {
              loader.dismiss();
              reject(e);
            }
          )
          .then(res => {
            document.querySelector(
              '#userEndTime'
            ).innerHTML = userUploadEndTime;
            const userDuration = userUploadEndTime - userUploadStartTime;
            document.querySelector('#totalUserTime').innerHTML = userDuration;
            // file time
            document.querySelector(
              '#fileUploadStartTime'
            ).innerHTML = fileUploadStartTime;
            document.querySelector(
              '#fileUploadEndTime'
            ).innerHTML = fileUploadEndTime;
            const fileUploadTime = fileUploadEndTime - fileUploadStartTime;
            document.querySelector(
              '#fileUploadTime'
            ).innerHTML = fileUploadTime;
            document.querySelector('#metrics').hidden = false;

            pushRunningWindow(
              'upload-image',
              'user',
              'value',
              userDuration,
              60
            );
            pushRunningWindow(
              'upload-image',
              'upload',
              'value',
              fileUploadTime,
              60
            );
          });
      }
    });

    // time find an image

    // time to upload

    // time fetch
  };
});
