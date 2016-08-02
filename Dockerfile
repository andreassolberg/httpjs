FROM node

RUN apt-get update && apt-get install git

RUN mkdir /usr/src/httpjs
COPY . /usr/src/httpjs/

WORKDIR /usr/src/httpjs

RUN npm install
RUN npm install -g bower
RUN cd public/ && bower install --allow-root
RUN cd /usr/src/httpjs/public/bower_components && git clone https://github.com/andreassolberg/uninett-bootstrap-theme.git uninett-theme && cd uninett-theme && bower install --allow-root
RUN curl -o /usr/src/httpjs/public/bower_components/uninett-theme/fonts/colfaxLight.woff http://mal.uninett.no/uninett-theme/fonts/colfaxLight.woff
RUN curl -o /usr/src/httpjs/public/bower_components/uninett-theme/fonts/colfaxMedium.woff http://mal.uninett.no/uninett-theme/fonts/colfaxMedium.woff
RUN curl -o /usr/src/httpjs/public/bower_components/uninett-theme/fonts/colfaxRegular.woff http://mal.uninett.no/uninett-theme/fonts/colfaxRegular.woff
RUN curl -o /usr/src/httpjs/public/bower_components/uninett-theme/fonts/colfaxThin.woff http://mal.uninett.no/uninett-theme/fonts/colfaxThin.woff
RUN curl -o /usr/src/httpjs/public/bower_components/uninett-theme/fonts/colfaxRegularItalic.woff http://mal.uninett.no/uninett-theme/fonts/colfaxRegularItalic.woff

EXPOSE 80
EXPOSE 443

CMD ["node" , "/usr/src/httpjs/app.js"]