window.addEventListener('load', function() {
  bantam.configure({
    apiKey: 'APIKEY',
  });

  window.uploadAndShowFile = function uploadAndShowFile(type) {
    selectFile(type).then(
      res => {
        console.log('result url', res.url);
        console.log('result metadata', res.metadata);

        const resizeToWidth = 500;

        document.querySelector('.ImageWrapper').style.background =
          res.metadata.dominantColor;

        document.querySelector('.ImageWrapper').style['padding-bottom'] =
          (res.metadata.height / res.metadata.width) * 100 + '%';

        document.querySelector('.ImageWrapper img').src = bantam.url(
          '@images/modification',
          {
            width: 500,
            url: res.url,
          },
          {
            cache: true,
          }
        );
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
      return {
        dismiss: function() {},
      };
    }

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
              bantam
                .run('@images/metadata', {
                  url: res.url,
                  colorFormat: 'hex',
                })
                .then(metadata => {
                  loader.dismiss();

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
});
