window.addEventListener('load', function() {
  bantam.configure({
    // apiKey: 'APIKEY',
  });

  window.uploadAndShowFile = function uploadAndShowFile(type) {
    selectFile(type).then(
      res => {
        console.log('result url', res.url);
        console.log('result metadata', res.metadata);

        document.querySelector('#thumbnail').src = bantam.url(
          '@images/modification',
          {
            width: 100,
            url: res.url,
          },
          {
            cache: true,
          }
        );

        document.querySelector('#medium').src = bantam.url(
          '@images/modification',
          {
            width: 300,
            url: res.url,
          },
          {
            cache: true,
          }
        );

        document.querySelector('#greyscale').src = bantam.url(
          '@images/modification',
          {
            url: res.url,
            width: 300,
            filter: 'greyscale',
          },
          {
            cache: true,
          }
        );

        document.querySelector('#border').style['border'] = `10px solid #888`;
        document.querySelector('#full').hidden = false;
        document.querySelector('#results').hidden = false;
      },
      e => {
        console.error('error', e);
      }
    );
  };

  window.selectFile = function selectFile(type) {
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

        bantam
          .file(input)
          .upload()
          .then(
            res => {
              // document.querySelector('.ImageWrapper .full').src = res.url;
              document.querySelector('#full').src = res.url;
              // document.querySelector('.ImageWrapper .border').src = res.url;
              document.querySelector('#border').src = res.url;
              bantam
                .run('@images/metadata', {
                  url: res.url,
                  colorFormat: 'hex',
                })
                .then(metadata => {
                  loader.dismiss();
                  console.log('metadata: ', metadata);
                  document.querySelector('.dominantColor').style[
                    'background-color'
                  ] = metadata.dominantColor;
                  document.querySelector('#colorCode').innerHTML =
                    metadata.dominantColor;
                  document.querySelector('#width').innerHTML = `Width ${
                    metadata.width
                  }px`;
                  document.querySelector('#height').innerHTML = `Height ${
                    metadata.height
                  }px`;
                  resolve({
                    url: res.url,
                    metadata: metadata,
                  });
                });
            },
            e => {
              loader.dismiss();
              reject(e);
            }
          );
      }
    });
  };

  window.getModificationExamples = function getModificationExamples() {
    console.log('clicked getModificationExamples');
    document.querySelector('.ModificaitonExamples').hidden = false;
  };
});
