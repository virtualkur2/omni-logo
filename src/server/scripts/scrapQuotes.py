from bs4 import BeautifulSoup
import requests
import re
import json
import random


index_list = []
index_dir = {
	"topic_index": index_list
}

category_list = []

category_dir = {
	"categories" : category_list
}

page_list = [] 

quotes_list = []

def index():
	index_url = 'https://www.brainyquote.com/topics'
	html = requests.get(index_url)
	soup = BeautifulSoup(html.text, "html.parser")
	index = soup.find_all('a', {"href": re.compile("/topic_index/")})
	for anchor_tag in index:
		index_list.append({"name": anchor_tag.text, "url": anchor_tag['href']})
	return json.dumps(index_dir)

def categories():
	for each in index_list:
		# print(each['url'])
		category(each['url'])
	return json.dumps(category_list)

def category(index_url):
	category_url = 'https://www.brainyquote.com' + index_url
	html = requests.get(category_url) #requesting url
	soup = BeautifulSoup(html.text, "html.parser") #making soup for scrappig 
	category = soup.find_all('a',{"href" : re.compile("/topics/")}) #to find tag "a" who contains category
	for anchor_tag in category:
		category_list.append({"name": anchor_tag.text, "url": anchor_tag['href']})

	return

def pages(category):
	url = "http://www.brainyquote.com/quotes/topics/topic_" + category + ".html"
	html = requests.get(url)
	soup = BeautifulSoup(html.text)
	div = soup.find('div',{"class":"quote-nav-msnry "})#to find total pages
	for li in div.find_all('li'):
		page_list.append(li) #we need second last li so appending to list
	total_pages = page_list[len(page_list) - 2].text #here we have total number of pages
	return total_pages

def quotes(category):
	url = "http://www.brainyquote.com" + category
	html = requests.get(url)
	soup = BeautifulSoup(html.text, "html.parser")
	divs =  soup.find_all('div', class_='clearfix')
	quotes_list = []
	for elements in divs:
		quote_anchor = elements.find_all('a', {"href": re.compile("/quotes/")})
		author_anchor = elements.find_all('a', {"href": re.compile("/authors/")})
		quotes_json = {}
		for quote in quote_anchor:
			quotes_json['quote'] = quote.text
			# print(quote.text)
		for author in author_anchor:
			quotes_json['author'] = author.text
			# print(author.text)
		quotes_list.append(quotes_json)
		# print(quote.descendants)
		# quotes_list.append(quote.text)
		# random_quote = { "quote" : random.choice(quotes_list)}
	return quotes_list

# index()
# categories()
IT_category = '/topics/information-technology-quotes'
Computer_category = '/topics/computers-quotes'
print(quotes(Computer_category))
