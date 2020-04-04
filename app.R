library(shiny)
library(shinythemes)
library(tidyverse)
library(r2d3)

## prepare data ###################
theme_list <- read_rds("data/theme_list.rds")
posts <- read_rds("data/posts.rds")

## UI ###################
ui <- fixedPage(
    
    tags$head(
        tags$link(href="styles.css", rel="stylesheet", type="text/css")
    ),
    
    tags$div(
        class = "app-title",
        tags$h1("r/52weeksofcooking in 2019"),
        tags$h4("Weekly challenges to cook something new"),
        br()
    ),
    
    fixedRow(
        column(width = 2),
        column(width = 4,
               selectInput("this_week", label = "Select week:",
                           theme_list$list,
                           width = 400)
        ),
        column(width = 4,
               sliderInput("upvotes", label = "Minimum upvotes",
                           min = 1, max = 200, value = 40)
        ),
        column(width = 2)
    ),
    
    fixedRow(
        column(width = 12, align = "center",
               d3Output("bubbles", height = "1000px", width = "1000px"))
    )
)

## Server ###################
server <- function(input, output) {
    
    selected_week <- reactive({
        theme_list %>% filter(list == input$this_week) %>%
            select(week) %>% .[[1]]
    })
    
    dat <- reactive({
        posts %>%
            filter(week == selected_week(),
                   score >= input$upvotes) %>%
            mutate(id = paste0(id, "|", dish, "$", permalink)) %>%
            rename(value = score) %>%
            select(id, value)
    })
    
    output$bubbles <- renderD3({
        r2d3(data = dat(), d3_version = 4, script = "bubbles_r2d3.js")
    })
}

# Run the application 
shinyApp(ui = ui, server = server)
